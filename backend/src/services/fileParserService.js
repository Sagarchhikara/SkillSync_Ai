const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extracts raw text from an uploaded resume file (PDF, DOCX).
 * 
 * @param {string} filePath - The absolute or relative path to the uploaded file.
 * @returns {Promise<string>} - The extracted raw text from the file.
 * @throws {Error} - If the file type is unsupported, file doesn't exist, or parsing fails.
 */
async function parseResumeFile(filePath) {
  try {
    // 1. Verify file exists
    await fs.access(filePath);
    
    // 2. Extract extension and normalize it
    const ext = path.extname(filePath).toLowerCase();
    
    // 3. Parse based on file type
    if (ext === '.pdf') {
       return await parsePdf(filePath);
    } else if (ext === '.docx' || ext === '.doc') {
       // Note: mammoth works best with .docx files. For older binary .doc formats, 
       // it might fail. In a mature environment, tools like 'word-extractor' might be added.
       return await parseDocx(filePath);
    } else {
       throw new Error(`Unsupported file type: "${ext}". Supported types are .pdf, .docx, and .doc`);
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`File not found at path: ${filePath}`);
    }
    // Re-throw the error to be handled by the caller
    throw error;
  }
}

/**
 * Parses a PDF file and extracts raw text.
 * @param {string} filePath 
 * @returns {Promise<string>}
 */
async function parsePdf(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    
    const extractedText = data.text ? data.text.trim() : "";
    if (!extractedText) {
      throw new Error("No readable text found in PDF (might be an image-based scanned PDF without OCR).");
    }
    
    return extractedText;
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}

/**
 * Parses a DOCX file and extracts raw text using Mammoth.
 * @param {string} filePath 
 * @returns {Promise<string>}
 */
async function parseDocx(filePath) {
  try {
    // mammoth.extractRawText extracts plainly formatted text from the docx XML
    const result = await mammoth.extractRawText({ path: filePath });
    
    // Mammoth returns any warnings encountered during parsing (e.g., unsupported features)
    // We can log them if needed, but for now we focus on the text value.
    const extractedText = result.value ? result.value.trim() : "";
    
    if (!extractedText) {
       throw new Error("No readable text found in DOCX file.");
    }
    
    return extractedText;
  } catch (error) {
    throw new Error(`Failed to parse Word Document: ${error.message}`);
  }
}

module.exports = {
  parseResumeFile
};
