const SkillExtractionService = require('../skillExtractionService');

describe('Skill Extraction Service', () => {

    // Test 1 — Basic Matching
    it('should correctly extract exact match skills', () => {
        const input = "I know JavaScript and React";
        const expected = ["javascript", "react"];
        const result = SkillExtractionService.extractSkills(input);

        // Assert that all expected skills are found
        expected.forEach(skill => {
            expect(result).toContain(skill);
        });
        expect(result.length).toBeGreaterThanOrEqual(expected.length);
    });

    // Test 2 — Case Insensitivity
    it('should extract skills case-insensitively', () => {
        const input = "PYTHON and Node.JS";
        const expected = ["python", "node.js"];
        const result = SkillExtractionService.extractSkills(input);

        expected.forEach(skill => {
            expect(result).toContain(skill);
        });
    });

    // Test 3 — Duplicate Skills
    it('should deduplicate skills', () => {
        const input = "React react REACT";
        const expected = ["react"];
        const result = SkillExtractionService.extractSkills(input);

        expect(result).toEqual(expected);
    });

    // Test 4 — No Matching Skills
    it('should return an empty array when no skills match', () => {
        const input = "I know cobol and fortran";
        const expected = [];
        const result = SkillExtractionService.extractSkills(input);

        expect(result).toEqual(expected);
    });

    // Test 5 — Empty Input
    it('should handle empty or null input safely', () => {
        expect(SkillExtractionService.extractSkills("")).toEqual([]);
        expect(SkillExtractionService.extractSkills(null)).toEqual([]);
        expect(SkillExtractionService.extractSkills(undefined)).toEqual([]);
    });

});
