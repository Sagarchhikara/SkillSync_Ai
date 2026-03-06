const { extractSkills, normalizeText } = require('../src/services/skillExtractionService');

describe('Skill Extraction Service', () => {
  describe('Text Normalization', () => {
    it('should handle null, undefined, and empty strings gracefully', () => {
      expect(normalizeText(null)).toBe("");
      expect(normalizeText(undefined)).toBe("");
      expect(normalizeText("")).toBe("");
    });

    it('should convert text to lowercase and replace excess whitespace', () => {
      const input = "  This   is \n\n a \t TEST!  ";
      const expected = "this is a test!";
      expect(normalizeText(input)).toBe(expected);
    });
  });

  describe('Skill Extraction Engine', () => {
    it('should return an empty array for invalid inputs', () => {
      expect(extractSkills(null)).toEqual([]);
      expect(extractSkills(undefined)).toEqual([]);
      expect(extractSkills("   ")).toEqual([]);
    });

    it('should extract correct skills from a standard resume sentence', () => {
      const input = "Full Stack Developer with experience in React, Node.js, MongoDB and AWS.";
      const skills = extractSkills(input);
      // It should NOT extract "node" simply because "node.js" exists.
      // It should accurately map "node.js" and others.
      expect(skills.sort()).toEqual(["aws", "mongodb", "node.js", "react"].sort());
    });

    it('should apply skill deduplication correctly', () => {
      const input = "Python Python Python developer";
      expect(extractSkills(input)).toEqual(["python"]);
    });

    it('should map abbreviations and normalize known skill variations', () => {
      const input = "I am a JS developer who uses K8s, NodeJS, and Py.";
      // JS -> javascript, K8s -> kubernetes, NodeJS -> node.js, Py -> python
      const skills = extractSkills(input);
      expect(skills.sort()).toEqual(["javascript", "kubernetes", "node.js", "python"].sort());
    });

    it('should extract skills with non-word boundary characters accurately', () => {
      // "C++", "C#", "C" can be tricky because of regex boundaries
      const input = "I code in C++, C# and standard C everyday.";
      const skills = extractSkills(input);
      
      // Expected to find all three specifically
      expect(skills.includes("c++")).toBe(true);
      expect(skills.includes("c#")).toBe(true);
      expect(skills.includes("c")).toBe(true);
    });

    it('should not extract skills that are substrings of other larger words', () => {
      const input = "going reactive in a big corporation";
      // Should NOT extract "go", "react", "c"
      const skills = extractSkills(input);
      expect(skills).toEqual([]);
    });
  });
});
