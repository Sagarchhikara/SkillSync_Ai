/**
 * Semantic logic matching service for SkillSync.
 * Uses @xenova/transformers to compute embeddings and matches skills.
 */
const { pipeline, cos_sim } = require('@xenova/transformers');

class EmbeddingService {
    static instance = null;
    static cache = new Map(); // Cache to store: skill -> vector (Array of numbers)
    static MAX_CACHE_SIZE = 2000; // Limit cache to 2000 unique skill vectors to bound memory usage

    static async getInstance() {
        if (!this.instance) {
            // Lazy load the lightweight MiniLM pipeline
            this.instance = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
                quantized: true,
            });
        }
        return this.instance;
    }

    /**
     * Enforces memory bounds on the in-memory cache to prevent leaks in production.
     */
    static checkCacheBounds() {
        if (this.cache.size > this.MAX_CACHE_SIZE) {
            console.warn(`[CACHE] Max cache size exceeded (${this.cache.size}). Evicting older entries...`);
            // Clear entire cache or evict a chunk of entries (e.g. oldest 500)
            // For simplicity and performance, we clear the map to free up RAM.
            this.cache.clear();
        }
    }

    /**
     * Retrieves embeddings for a list of skills using cache where possible,
     * and batches requests for missing skills to minimize transformer overhead.
     */
    static async getEmbeddings(skillsArray) {
        const results = new Array(skillsArray.length);
        const missingSkills = [];
        const missingIndices = [];

        // Check cache
        for (let i = 0; i < skillsArray.length; i++) {
            const skill = skillsArray[i];
            if (this.cache.has(skill)) {
                results[i] = this.cache.get(skill);
            } else {
                missingSkills.push(skill);
                missingIndices.push(i);
            }
        }

        // Run extractor for missing skills in one batch
        if (missingSkills.length > 0) {
            const extractor = await this.getInstance();
            const output = await extractor(missingSkills, { pooling: 'mean', normalize: true });
            
            // Check cache bounds before inserting new elements
            this.checkCacheBounds();

            for (let i = 0; i < missingSkills.length; i++) {
                const vector = Array.from(output.data.subarray(i * 384, (i + 1) * 384));
                this.cache.set(missingSkills[i], vector);
                results[missingIndices[i]] = vector;
            }
        }

        return results;
    }
}

/**
 * Normalizes an array of skills (handles nulls, lowercases, trims, and deduplicates).
 * @param {Array<String>} skillsArray - Raw array of skills
 * @returns {Array<String>} - Normalized array of skills
 */
const normalizeSkills = (skillsArray) => {
    if (!skillsArray || !Array.isArray(skillsArray)) {
        return [];
    }
    const cleaned = skillsArray
        .filter(skill => skill != null && skill !== '')
        .map(skill => String(skill).toLowerCase().trim())
        .filter(skill => skill.length > 0);
    return [...new Set(cleaned)];
};

/**
 * Preloads the transformer pipeline model during startup and runs a warm-up inference
 * to prevent cold-start latency spikes.
 */
const preloadModel = async () => {
    try {
        console.log('[MODEL] Preloading Xenova/all-MiniLM-L6-v2 model...');
        const extractor = await EmbeddingService.getInstance();
        
        console.log('[MODEL] Running warm-up inference...');
        // Perform a quick inference to warm up the pipeline engine
        await EmbeddingService.getEmbeddings(['warmup_skill_1', 'warmup_skill_2']);
        
        console.log('[MODEL] Inference engine warmed up and ready.');
        return true;
    } catch (error) {
        console.error('[MODEL] Model preloading failed. Continuing with lazy loading fallback...', error);
        return false;
    }
};

/**
 * Calculates match percentage and identifies matched/missing skills using semantic embeddings.
 * Maintains compatibility with legacy properties while exposing new detailed structure.
 */
const calculateMatch = async (resumeSkills, requiredSkills, threshold = 0.70) => {
    const normalizedResumeSkills = normalizeSkills(resumeSkills);
    const normalizedRequiredSkills = normalizeSkills(requiredSkills);

    if (normalizedRequiredSkills.length === 0) {
        return {
            matchPercentage: 0, matchedSkills: [], missingSkills: [],
            match_percentage: 0, matched_skills: [], missing_skills: []
        };
    }
    if (normalizedResumeSkills.length === 0) {
        return {
            matchPercentage: 0, matchedSkills: [], missingSkills: normalizedRequiredSkills,
            match_percentage: 0, matched_skills: [], missing_skills: normalizedRequiredSkills
        };
    }

    try {
        if (global.FORCE_MATCH_FALLBACK) {
            throw new Error("Forced fallback for testing");
        }

        // Get vectors (utilizes the fast cache lookup + batching)
        const resumeVectors = await EmbeddingService.getEmbeddings(normalizedResumeSkills);
        const jobVectors = await EmbeddingService.getEmbeddings(normalizedRequiredSkills);

        const matchedSkillsLegacy = [];
        const missingSkills = [];
        const matchedSkillsDetailed = [];

        for (let i = 0; i < normalizedRequiredSkills.length; i++) {
            const jobSkill = normalizedRequiredSkills[i];
            const jVec = jobVectors[i];
            
            let bestScore = -1.0;
            let bestMatch = null;

            for (let j = 0; j < normalizedResumeSkills.length; j++) {
                const rVec = resumeVectors[j];
                const sim = cos_sim(jVec, rVec);
                if (sim > bestScore) {
                    bestScore = sim;
                    bestMatch = normalizedResumeSkills[j];
                }
            }

            if (bestScore >= threshold) {
                matchedSkillsLegacy.push(jobSkill);
                matchedSkillsDetailed.push({
                    job_skill: jobSkill,
                    matched_with: bestMatch,
                    similarity: parseFloat(bestScore.toFixed(2))
                });
            } else {
                missingSkills.push(jobSkill);
            }
        }

        const ratio = matchedSkillsLegacy.length / normalizedRequiredSkills.length;
        const matchPercentage = Math.round(ratio * 100);

        return {
            // Legacy interface (for existing Score Cards)
            matchPercentage,
            matchedSkills: matchedSkillsLegacy,
            missingSkills,
            
            // New strict JSON structure format (from requirements)
            match_percentage: matchPercentage,
            matched_skills: matchedSkillsDetailed,
            missing_skills: missingSkills
        };
    } catch (error) {
        console.error("[MODEL] Embedding Service Error: Returning fallback logic...", error);
        
        // Fallback exact match logic to make testing/development robust
        return fallbackStrictMatch(normalizedResumeSkills, normalizedRequiredSkills);
    }
};

const fallbackStrictMatch = (resumeSkills, requiredSkills) => {
    const resumeSet = new Set(resumeSkills);
    const matchedSkills = [];
    const missingSkills = [];

    for (const skill of requiredSkills) {
        if (resumeSet.has(skill)) {
            matchedSkills.push(skill);
        } else {
            missingSkills.push(skill);
        }
    }
    const matchPercentage = requiredSkills.length > 0 ? Math.round((matchedSkills.length / requiredSkills.length) * 100) : 0;
    return {
        matchPercentage, matchedSkills, missingSkills,
        match_percentage: matchPercentage,
        matched_skills: matchedSkills.map(s => ({ job_skill: s, matched_with: s, similarity: 1.0 })),
        missing_skills: missingSkills
    };
};

module.exports = {
    calculateMatch,
    normalizeSkills,
    preloadModel
};
