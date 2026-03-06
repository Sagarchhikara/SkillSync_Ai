const skillDictionary = require('../data/skillDictionary');

/**
 * Skill Normalization Map.
 * Used to map variations, abbreviations, or shorthand representations of a skill 
 * to their standardized dictionary equivalent to ensure consistent tracking.
 */
const skillNormalizationMap = {
  "nodejs": "node.js",
  "node": "node.js",
  "js": "javascript",
  "py": "python",
  "ts": "typescript",
  "reactjs": "react",
  "react.js": "react",
  "vue.js": "vue",
  "vuejs": "vue",
  "nextjs": "next.js",
  "expressjs": "express.js",
  "amazon web services": "aws",
  "google cloud": "gcp",
  "google cloud platform": "gcp",
  "k8s": "kubernetes",
  "golang": "go",
  "natural language processing": "nlp",
  "artificial intelligence": "ai",
  "ml": "machine learning",
  "dl": "deep learning"
};

/**
 * Normalizes text to prepare it for matching.
 * Converts to lowercase, and replaces excessive whitespace/newlines with single spaces
 * so that substring boundaries are consistent.
 * 
 * @param {string} text - The raw text from the resume.
 * @returns {string} - The cleaned and normalized string.
 */
const normalizeText = (text) => {
  if (!text || typeof text !== 'string') return "";
  
  // Convert to lower case and replace newlines, tabs, and excess spaces.
  return text.toLowerCase().replace(/[\n\r\t]+/g, ' ').replace(/\s+/g, ' ').trim();
};

/**
 * Extracts technical skills from raw resume text using a dictionary-based NLP approach.
 * This is a pure function with no side-effects.
 * 
 * @param {string} resumeText - The raw text extracted from a resume.
 * @returns {Array<string>} - An array of unique, standardized technical skills.
 */
const extractSkills = (resumeText) => {
  if (!resumeText) return [];

  const normalizedText = normalizeText(resumeText);
  if (!normalizedText) return [];

  const matchedSkills = new Set();
  
  // We temporarily pad the text with spaces to simplify edge boundaries (start/end of string)
  // This helps regex like /(?:^|\s)skill(?:$|\s)/ run consistently without failing on the first word.
  const searchableText = ` ${normalizedText} `;

  // We sort keywords by length descending so we match longer, more specific 
  // compound keywords like "node.js" before shorter ones like "js" or "node".
  const targetKeywords = [
    ...skillDictionary, 
    ...Object.keys(skillNormalizationMap)
  ].sort((a, b) => b.length - a.length);

  let dynamicText = searchableText;
  
  for (const keyword of targetKeywords) {
      if (!dynamicText.trim()) break;

      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Strict Boundary checking
      // Matches boundaries that are non-word characters OR the start/end of the string.
      // E.g. space, comma, period, parens. 
      // We lookbehind `(?<=[...])` and lookahead `(?=[...])` so we don't consume the separating characters,
      // which allows consecutive skills (e.g. "react, node.js") to both be found even though they share the comma.
      const boundaryRegex = `(?<=[\\s,.\/;:\\-"'\`()!]|^)${escapedKeyword}(?=[\\s,.\/;:\\-"'\`()!]|$)`;
      const regexPattern = new RegExp(boundaryRegex, 'gi');
      
      if (regexPattern.test(dynamicText)) {
          const finalSkill = skillNormalizationMap[keyword] || keyword;
          matchedSkills.add(finalSkill);
          
          // Once we find a valid skill (especially a multi-word/long one like node.js), 
          // we strip it out of the string so shorter fallback maps like "js" or "node" don't trigger
          // on the remnants of it. 
          // We replace it with spaces so boundaries between adjacent words are maintained.
          dynamicText = dynamicText.replace(regexPattern, ' ');
      }
  }

  return Array.from(matchedSkills);
};

module.exports = {
  extractSkills,
  normalizeText,
};
