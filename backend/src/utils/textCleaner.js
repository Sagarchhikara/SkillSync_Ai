/**
 * Clean and normalize raw resume text extracted from PDFs.
 * 
 * @param {string} text - Raw unformatted text.
 * @returns {string} Cleaned, single-spaced lowercase text.
 */
function cleanText(text) {
    if (!text || typeof text !== 'string') return '';

    return text
        .toLowerCase() // 1. Normalize case
        .replace(/[\n\r]+/g, ' ') // 2. Replace newlines with spaces
        .replace(/[^\w\s\.\-]/g, '') // 3. Keep words, spaces, dots, and hyphens (removes weird unicode artifacts)
        .replace(/\s{2,}/g, ' ') // 4. Collapse multiple spaces into one space
        .trim(); // 5. Remove leading/trailing spaces
}

module.exports = { cleanText };
