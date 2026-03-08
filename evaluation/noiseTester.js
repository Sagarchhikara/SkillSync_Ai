const noiseSamples = require("./noise_samples.json");

// Simple skill extraction from text
function extractSkillsFromText(text) {
    const domains = require("./skill_domains.json");
    const allSkills = [];
    
    Object.values(domains).forEach(domainSkills => {
        allSkills.push(...domainSkills);
    });
    
    const normalizedText = text.toLowerCase();
    const extracted = [];
    
    allSkills.forEach(skill => {
        const normalizedSkill = skill.toLowerCase();
        // Check for exact match or word boundary match
        const regex = new RegExp(`\\b${normalizedSkill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regex.test(normalizedText)) {
            extracted.push(skill);
        }
    });
    
    return [...new Set(extracted)]; // Remove duplicates
}

function generateNoiseTest() {
    const randomText = noiseSamples.resumeTexts[
        Math.floor(Math.random() * noiseSamples.resumeTexts.length)
    ];
    
    const extractedSkills = extractSkillsFromText(randomText);
    
    return {
        scenario: "Noise Test (Text Extraction)",
        resumeText: randomText,
        extractedSkills,
        expectedSkillCount: extractedSkills.length,
        description: "Testing skill extraction from real resume text"
    };
}

function testNoiseExtraction() {
    const results = [];
    
    noiseSamples.resumeTexts.forEach(text => {
        const extracted = extractSkillsFromText(text);
        
        results.push({
            text,
            extractedSkills: extracted,
            skillCount: extracted.length,
            passed: extracted.length > 0
        });
    });
    
    return results;
}

module.exports = {
    extractSkillsFromText,
    generateNoiseTest,
    testNoiseExtraction
};
