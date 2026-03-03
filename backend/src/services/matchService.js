/**
 * Pure logic matching service for SkillSync.
 * Does NOT depend on Express or database access.
 */

/**
 * Normalizes an array of skills (handles nulls, lowercases, trims, and deduplicates).
 * @param {Array<String>} skillsArray - Raw array of skills
 * @returns {Array<String>} - Normalized array of skills
 */
const normalizeSkills = (skillsArray) => {
    if (!skillsArray || !Array.isArray(skillsArray)) {
        return [];
    }

    // Convert to lowercase, trim whitespace, and filter out falsy values
    const cleaned = skillsArray
        .filter(skill => skill != null && skill !== '') // filter out null, undefined, empty string
        .map(skill => String(skill).toLowerCase().trim())
        .filter(skill => skill.length > 0);

    return [...new Set(cleaned)];
};

/**
 * Calculates match percentage and identifies matched/missing skills.
 * 
 * @param {Array<String>} resumeSkills - Skills from the user's resume
 * @param {Array<String>} requiredSkills - Skills required for the job
 * @returns {Object} { matchPercentage, matchedSkills, missingSkills }
 */
const calculateMatch = (resumeSkills, requiredSkills) => {
    // Step 1: Normalize Input
    const normalizedResumeSkills = normalizeSkills(resumeSkills);
    const normalizedRequiredSkills = normalizeSkills(requiredSkills);

    // Step 2: Convert Resume Skills to Set for O(1) lookups
    const resumeSet = new Set(normalizedResumeSkills);

    const matchedSkills = [];
    const missingSkills = [];

    // Step 3: Compute Intersection and Difference
    for (const skill of normalizedRequiredSkills) {
        if (resumeSet.has(skill)) {
            matchedSkills.push(skill);
        } else {
            missingSkills.push(skill);
        }
    }

    // Step 4: Calculate Score
    let matchPercentage = 0;

    // Avoid division by zero edge case
    if (normalizedRequiredSkills.length > 0) {
        // Formula: (Number of matched skills / Total required skills) * 100
        const ratio = matchedSkills.length / normalizedRequiredSkills.length;
        matchPercentage = Math.round(ratio * 100);
    }

    return {
        matchPercentage,
        matchedSkills,
        missingSkills
    };
};

module.exports = {
    calculateMatch,
    normalizeSkills
};
