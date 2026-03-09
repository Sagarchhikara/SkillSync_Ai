/**
 * Semantic logic matching service for SkillSync.
 * Uses @xenova/transformers to compute embeddings and matches skills.
 */
const { pipeline, cos_sim } = require('@xenova/transformers');

class EmbeddingService {
    static instance = null;

    static async getInstance() {
        if (!this.instance) {
            // Lazy load the lightweight MiniLM pipeline
            this.instance = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
                quantized: true,
            });
        }
        return this.instance;
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
        const extractor = await EmbeddingService.getInstance();
        
        const resumeOutput = await extractor(normalizedResumeSkills, { pooling: 'mean', normalize: true });
        const jobOutput = await extractor(normalizedRequiredSkills, { pooling: 'mean', normalize: true });
        
        const resumeVectors = [];
        for (let i = 0; i < normalizedResumeSkills.length; ++i) {
            resumeVectors.push(Array.from(resumeOutput.data.subarray(i * 384, (i + 1) * 384)));
        }

        const jobVectors = [];
        for (let i = 0; i < normalizedRequiredSkills.length; ++i) {
            jobVectors.push(Array.from(jobOutput.data.subarray(i * 384, (i + 1) * 384)));
        }

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
        console.error("Embedding Service Error: Returning fallback logic... ", error);
        
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
}

module.exports = {
    calculateMatch,
    normalizeSkills
};
