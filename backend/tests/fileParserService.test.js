const path = require('path');
const fs = require('fs').promises;

// Mock pdf-parse
const pdfParse = require('pdf-parse');
jest.mock('pdf-parse', () => jest.fn());

// Fix for mammoth mocking
jest.mock('mammoth', () => ({
  extractRawText: jest.fn()
}));
const mammoth = require('mammoth');

const { parseResumeFile } = require('../src/services/fileParserService');

jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    readFile: jest.fn(),
  }
}));

describe('File Parser Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw "File not found" error if file does not exist', async () => {
    const error = new Error('ENOENT');
    error.code = 'ENOENT';
    fs.access.mockRejectedValueOnce(error);

    await expect(parseResumeFile('nonexistent.pdf')).rejects.toThrow('File not found at path: nonexistent.pdf');
  });

  it('should throw an error for unsupported file extensions', async () => {
    fs.access.mockResolvedValueOnce();

    await expect(parseResumeFile('image.png')).rejects.toThrow('Unsupported file type: ".png". Supported types are .pdf, .docx, and .doc');
  });

  describe('PDF Parsing', () => {
    it('should successfully parse a valid PDF file', async () => {
      fs.access.mockResolvedValueOnce();
      fs.readFile.mockResolvedValueOnce(Buffer.from('mock pdf content'));
      pdfParse.mockResolvedValueOnce({ text: '  John Doe\nSoftware Engineer  ' });

      const text = await parseResumeFile('resume.pdf');
      
      expect(text).toBe('John Doe\nSoftware Engineer');
      expect(fs.readFile).toHaveBeenCalledWith('resume.pdf');
      expect(pdfParse).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if the PDF has no readable text (e.g., scanned image)', async () => {
      fs.access.mockResolvedValueOnce();
      fs.readFile.mockResolvedValueOnce(Buffer.from('mock pdf content'));
      pdfParse.mockResolvedValueOnce({ text: '' });

      await expect(parseResumeFile('scanned_resume.pdf')).rejects.toThrow('No readable text found in PDF (might be an image-based scanned PDF without OCR).');
    });

    it('should wrap internally thrown errors from pdf-parse', async () => {
      fs.access.mockResolvedValueOnce();
      fs.readFile.mockResolvedValueOnce(Buffer.from('corrupt content'));
      pdfParse.mockRejectedValueOnce(new Error('Invalid PDF structure'));

      await expect(parseResumeFile('corrupt.pdf')).rejects.toThrow('Failed to parse PDF: Invalid PDF structure');
    });
  });

  describe('DOCX/DOC Parsing', () => {
    it('should successfully parse a valid DOCX file', async () => {
      fs.access.mockResolvedValueOnce();
      mammoth.extractRawText.mockResolvedValueOnce({ value: '  Jane Doe\nData Scientist  ' });

      const text = await parseResumeFile('resume.docx');
      
      expect(text).toBe('Jane Doe\nData Scientist');
      expect(mammoth.extractRawText).toHaveBeenCalledWith({ path: 'resume.docx' });
    });

    it('should throw an error if the DOCX file has no text value', async () => {
      fs.access.mockResolvedValueOnce();
      mammoth.extractRawText.mockResolvedValueOnce({ value: '' });

      await expect(parseResumeFile('empty.docx')).rejects.toThrow('No readable text found in DOCX file.');
    });

    it('should parse older .doc extensions using the same method', async () => {
      fs.access.mockResolvedValueOnce();
      mammoth.extractRawText.mockResolvedValueOnce({ value: 'John Smith' });

      const text = await parseResumeFile('old_resume.doc');
      
      expect(text).toBe('John Smith');
      expect(mammoth.extractRawText).toHaveBeenCalledWith({ path: 'old_resume.doc' });
    });

    it('should wrap internal mammoth errors', async () => {
      fs.access.mockResolvedValueOnce();
      mammoth.extractRawText.mockRejectedValueOnce(new Error('Zip format error'));

      await expect(parseResumeFile('corrupt.docx')).rejects.toThrow('Failed to parse Word Document: Zip format error');
    });
  });
});
