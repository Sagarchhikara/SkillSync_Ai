jest.mock('@xenova/transformers', () => {
    return {
        pipeline: jest.fn().mockRejectedValue(new Error('Mocking transformers for strict fallback')),
        cos_sim: jest.fn()
    };
});

const { calculateMatch, normalizeSkills } = require('../matchService');

describe('Matching Engine - Pure Logic (matchService)', () => {

    describe('normalizeSkills()', () => {
        it('should lowercase and trim all skills', () => {
            const input = [' Node.JS ', 'MongoDB  ', '  REACT'];
            const expected = ['node.js', 'mongodb', 'react'];
            const result = normalizeSkills(input);
            expect(result).toHaveLength(3);
            expect(result).toEqual(expect.arrayContaining(expected));
        });

        it('should filter out duplicate skills', () => {
            const input = ['react', 'React', ' REACT ', 'node'];
            const expected = ['react', 'node'];
            const result = normalizeSkills(input);
            expect(result).toHaveLength(2);
            expect(result).toEqual(expect.arrayContaining(expected));
        });

        it('should handle falsy values gracefully', () => {
            const input = ['node', null, '', undefined, 'react'];
            const expected = ['node', 'react'];
            const result = normalizeSkills(input);
            expect(result).toHaveLength(2);
            expect(result).toEqual(expect.arrayContaining(expected));
        });

        it('should return an empty array if input is null or undefined', () => {
            expect(normalizeSkills(null)).toEqual([]);
            expect(normalizeSkills(undefined)).toEqual([]);
        });
    });

    describe('calculateMatch()', () => {
        it('should return 100% when all required skills are present in resume', async () => {
            const resume = ['java', 'spring', 'aws', 'docker'];
            const required = ['java', 'spring', 'aws'];
            const result = await calculateMatch(resume, required);

            expect(result.matchPercentage).toBe(100);
            expect(result.matchedSkills).toEqual(['java', 'spring', 'aws']);
            expect(result.missingSkills).toHaveLength(0);
        });

        it('should return correct percentage for partial matches (rounding)', async () => {
            const resume = ['node', 'react', 'mongodb'];
            const required = ['node', 'react', 'docker']; // 2 out of 3 = 66.666...
            const result = await calculateMatch(resume, required);

            expect(result.matchPercentage).toBe(67);
            expect(result.matchedSkills).toEqual(['node', 'react']);
            expect(result.missingSkills).toEqual(['docker']);
        });

        it('should return 0% when there are no matching skills', async () => {
            const resume = ['python', 'django'];
            const required = ['node', 'react'];
            const result = await calculateMatch(resume, required);

            expect(result.matchPercentage).toBe(0);
            expect(result.matchedSkills).toHaveLength(0);
            expect(result.missingSkills).toEqual(['node', 'react']);
        });

        it('should return 0% if required skills array is empty without throwing division by zero', async () => {
            const resume = ['node', 'react'];
            const required = [];
            const result = await calculateMatch(resume, required);

            expect(result.matchPercentage).toBe(0);
            expect(result.matchedSkills).toHaveLength(0);
            expect(result.missingSkills).toHaveLength(0);
        });

        it('should return 0% if resume skills array is empty', async () => {
            const resume = [];
            const required = ['node', 'react'];
            const result = await calculateMatch(resume, required);

            expect(result.matchPercentage).toBe(0);
            expect(result.matchedSkills).toHaveLength(0);
            expect(result.missingSkills).toEqual(['node', 'react']);
        });

        it('should be robust against messy inputs and types', async () => {
            const resume = [' Java ', null, 'Spring', ''];
            const required = ['java', undefined, ' docker '];
            const result = await calculateMatch(resume, required);

            expect(result.matchPercentage).toBe(50); // 1 out of 2 valid required skills
            expect(result.matchedSkills).toEqual(['java']);
            expect(result.missingSkills).toEqual(['docker']);
        });
    });
});
