/**
 * Bug Condition Exploration Test
 * 
 * **Property 1: Fault Condition - Complex PDF Parsing Failure**
 * **Validates: Requirements 2.1, 2.2, 2.3**
 * 
 * CRITICAL: This test is EXPECTED TO FAIL on unfixed code (without canvas dependency).
 * The failure confirms that the bug exists and validates our root cause hypothesis.
 * 
 * DO NOT attempt to fix this test or the code when it fails.
 * 
 * This test encodes the expected behavior - it will validate the fix when it passes
 * after the canvas dependency is added and configured.
 * 
 * GOAL: Surface counterexamples that demonstrate the bug exists
 * - Test PDFs with embedded images
 * - Test PDFs with complex multi-column formatting
 * - Test PDFs from design tools (Figma/Canva)
 * 
 * EXPECTED OUTCOME on UNFIXED code:
 * - Test FAILS with MODULE_NOT_FOUND error for 'canvas'
 * - OR Test FAILS with canvas-related parsing errors
 * - Counterexamples document specific error messages and which PDF types fail
 */

const fs = require('fs').promises;
const path = require('path');
const PDFDocument = require('pdfkit');

// Import the actual implementation (NOT mocked)
jest.unmock('pdf-parse');
jest.unmock('fs');

const { parseResumeFile } = require('../src/services/fileParserService');

describe('Bug Condition Exploration - Complex PDF Parsing', () => {
  const testPdfDir = path.join(__dirname, 'fixtures', 'bug-exploration');
  
  beforeAll(async () => {
    // Create test directory
    await fs.mkdir(testPdfDir, { recursive: true });
  });

  afterAll(async () => {
    // Clean up test PDFs
    try {
      const files = await fs.readdir(testPdfDir);
      for (const file of files) {
        await fs.unlink(path.join(testPdfDir, file));
      }
      await fs.rmdir(testPdfDir);
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  /**
   * Test Case 1: PDF with Embedded Image
   * 
   * This test creates a PDF with an embedded image, which requires canvas
   * for rendering. On unfixed code (without canvas dependency), this should
   * fail with a canvas-related error.
   * 
   * Expected Counterexample: MODULE_NOT_FOUND error for 'canvas' or
   * canvas rendering error during PDF parsing.
   */
  test('should parse PDF with embedded image successfully', async () => {
    const pdfPath = path.join(testPdfDir, 'resume_with_image.pdf');
    
    // Create a PDF with embedded image using pdfkit
    await new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const writeStream = require('fs').createWriteStream(pdfPath);
      
      doc.pipe(writeStream);
      
      // Add text content
      doc.fontSize(16).text('John Doe', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text('Software Engineer');
      doc.moveDown();
      
      // Add an embedded image (this requires canvas for parsing)
      // Create a simple rectangle as an image placeholder
      doc.rect(100, 200, 100, 100).fill('#3498db');
      doc.moveDown(8);
      
      doc.text('Skills: JavaScript, Node.js, React, MongoDB');
      doc.text('Experience: 5 years in full-stack development');
      
      doc.end();
      
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // Attempt to parse the PDF with embedded image
    // On UNFIXED code: This should FAIL with canvas-related error
    // On FIXED code: This should SUCCEED and return the text content
    const result = await parseResumeFile(pdfPath);
    
    // Expected behavior (will pass after fix is implemented)
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    expect(result).toContain('John Doe');
    expect(result).toContain('Software Engineer');
  });

  /**
   * Test Case 2: PDF with Complex Multi-Column Formatting
   * 
   * This test creates a PDF with complex multi-column layout, which may
   * require canvas for proper rendering. On unfixed code, this should
   * fail with canvas-related errors.
   * 
   * Expected Counterexample: Canvas rendering error or MODULE_NOT_FOUND
   * error for 'canvas' module.
   */
  test('should parse PDF with complex multi-column formatting successfully', async () => {
    const pdfPath = path.join(testPdfDir, 'resume_complex_layout.pdf');
    
    // Create a PDF with complex layout
    await new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const writeStream = require('fs').createWriteStream(pdfPath);
      
      doc.pipe(writeStream);
      
      // Header with background
      doc.rect(0, 0, doc.page.width, 100).fill('#2c3e50');
      doc.fillColor('#ffffff').fontSize(20).text('Jane Smith', 50, 30);
      doc.fontSize(12).text('Senior Full-Stack Developer', 50, 60);
      
      // Reset color and add content with columns
      doc.fillColor('#000000');
      doc.moveDown(3);
      
      // Left column
      doc.fontSize(14).text('Experience', 50, 150);
      doc.fontSize(10).text('Company A - 2020-2023', 50, 175);
      doc.text('Led development team', 50, 190);
      
      // Right column (simulated with positioning)
      doc.fontSize(14).text('Skills', 350, 150);
      doc.fontSize(10).text('JavaScript, TypeScript', 350, 175);
      doc.text('React, Node.js, MongoDB', 350, 190);
      
      // Add shapes for visual complexity
      doc.rect(50, 250, 200, 2).fill('#3498db');
      doc.rect(350, 250, 200, 2).fill('#3498db');
      
      doc.end();
      
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // Attempt to parse the complex PDF
    // On UNFIXED code: This should FAIL with canvas-related error
    // On FIXED code: This should SUCCEED and return the text content
    const result = await parseResumeFile(pdfPath);
    
    // Expected behavior (will pass after fix is implemented)
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    expect(result).toContain('Jane Smith');
    expect(result).toContain('Senior Full-Stack Developer');
  });

  /**
   * Test Case 3: PDF with Vector Graphics (Design Tool Style)
   * 
   * This test creates a PDF with vector graphics similar to what design
   * tools like Figma or Canva would produce. These PDFs typically require
   * canvas for rendering complex graphics.
   * 
   * Expected Counterexample: Canvas rendering error or MODULE_NOT_FOUND
   * error for 'canvas' module.
   */
  test('should parse PDF with vector graphics (design tool style) successfully', async () => {
    const pdfPath = path.join(testPdfDir, 'resume_design_tool.pdf');
    
    // Create a PDF with vector graphics
    await new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const writeStream = require('fs').createWriteStream(pdfPath);
      
      doc.pipe(writeStream);
      
      // Add decorative vector graphics
      doc.circle(100, 100, 50).fill('#e74c3c');
      doc.polygon([200, 50], [250, 150], [150, 150]).fill('#3498db');
      
      // Add text content
      doc.fillColor('#000000');
      doc.fontSize(18).text('Alex Johnson', 50, 200);
      doc.fontSize(12).text('UX/UI Designer & Developer', 50, 230);
      doc.moveDown();
      
      // Add more decorative elements
      doc.roundedRect(50, 280, 500, 100, 10).stroke('#95a5a6');
      doc.fontSize(10).text('Experienced in creating beautiful user interfaces', 60, 300);
      doc.text('Proficient in Figma, Adobe XD, React, and CSS', 60, 320);
      
      // Add gradient-like effect with overlapping shapes
      doc.circle(500, 400, 30).fillOpacity(0.3).fill('#9b59b6');
      doc.circle(520, 420, 30).fillOpacity(0.3).fill('#3498db');
      
      doc.end();
      
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // Attempt to parse the design tool style PDF
    // On UNFIXED code: This should FAIL with canvas-related error
    // On FIXED code: This should SUCCEED and return the text content
    const result = await parseResumeFile(pdfPath);
    
    // Expected behavior (will pass after fix is implemented)
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    expect(result).toContain('Alex Johnson');
    expect(result).toContain('UX/UI Designer');
  });

  /**
   * Test Case 4: Simple Text PDF (Control Test)
   * 
   * This test verifies that simple text-only PDFs continue to work even
   * on unfixed code. This confirms that the bug is specific to PDFs
   * requiring canvas rendering, not all PDFs.
   * 
   * Expected Outcome: This test should PASS even on unfixed code,
   * confirming selective failure for canvas-requiring PDFs only.
   */
  test('should parse simple text-only PDF successfully (control test)', async () => {
    const pdfPath = path.join(testPdfDir, 'simple_text_resume.pdf');
    
    // Create a simple text-only PDF
    await new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const writeStream = require('fs').createWriteStream(pdfPath);
      
      doc.pipe(writeStream);
      
      // Only text, no images or complex graphics
      doc.fontSize(16).text('Simple Resume');
      doc.moveDown();
      doc.fontSize(12).text('Name: Test User');
      doc.text('Skills: JavaScript, Node.js');
      doc.text('Experience: 3 years');
      
      doc.end();
      
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // This should work even on unfixed code
    const result = await parseResumeFile(pdfPath);
    
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    expect(result).toContain('Simple Resume');
    expect(result).toContain('Test User');
  });
});
