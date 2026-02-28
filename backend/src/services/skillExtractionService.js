const { cleanText } = require('../utils/textCleaner');
const skillDictionary = require('../utils/skillDictionary.json');

/**
 * Service to extract skills strictly matching a predefined dictionary.
 * Does not depend on Express or DB functions.
 */
class SkillExtractionService {
    /**
     * Extracts predefined skills from raw resume text
     * @param {string} rawText - Unformatted raw resume string
     * @returns {string[]} Deduplicated array of lowercase skills
     */
    static extractSkills(rawText) {
        if (!rawText || typeof rawText !== 'string') {
            return [];
        }

        // 1. Clean and normalize the text
        const cleanedText = cleanText(rawText);

        // 2. Extract matches without fuzzy logic (v1 strict exact word matching)
        const extractedSkills = new Set();

        skillDictionary.forEach((dictSkill) => {
            // Escape special regex characters in the dictionary skill (e.g. node.js -> node\.js)
            const escapedSkill = dictSkill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            // Boundary matching: we require the skill to exist as a whole word 
            // Avoids partial matches like finding "java" inside "javascript"
            const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');

            if (regex.test(cleanedText)) {
                extractedSkills.add(dictSkill);
            }
        });

        // 3. Return as a clean deduced array
        return Array.from(extractedSkills);
    }
}

module.exports = SkillExtractionService;
