# Implementation Plan

- [-] 1. Write bug condition exploration test
  - **Property 1: Fault Condition** - Complex PDF Parsing Failure
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Test concrete failing cases - PDFs with embedded images or complex formatting
  - Test that parseResumeFile fails with canvas-related errors for PDFs requiring canvas rendering
  - Test cases: PDF with embedded image, PDF with complex multi-column formatting, PDF from design tools (Figma/Canva)
  - Run test on UNFIXED code (without canvas dependency installed)
  - **EXPECTED OUTCOME**: Test FAILS with MODULE_NOT_FOUND error for 'canvas' or canvas-related parsing errors
  - Document counterexamples found (specific error messages, which PDF types fail)
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.1, 2.2, 2.3_

- [~] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Simple PDF and DOCX Parsing
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs (simple text PDFs, DOCX files)
  - Test simple text-based PDF parsing produces expected output on unfixed code
  - Test DOCX file parsing with mammoth produces expected output on unfixed code
  - Test error handling for invalid file paths produces expected errors on unfixed code
  - Test error handling for unsupported file types produces expected errors on unfixed code
  - Test error handling for files with no readable text produces expected errors on unfixed code
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [~] 3. Fix for PDF parsing failure with embedded images or complex formatting

  - [~] 3.1 Add canvas dependency to package.json
    - Add "canvas": "^2.11.2" to the dependencies section
    - Verify compatibility with pdf-parse v2.4.5 (canvas v2.x is compatible)
    - Run npm install to install the canvas dependency
    - _Bug_Condition: isBugCondition(input) where input.fileExtension === '.pdf' AND pdfRequiresCanvasRendering(input.fileBuffer) AND NOT canvasLibraryAvailable()_
    - _Expected_Behavior: PDFs with embedded images or complex formatting should be successfully parsed and text extracted_
    - _Preservation: Simple text-based PDFs, DOCX parsing, error handling for unsupported file types, file existence validation, and error messages for PDFs with no readable text must remain unchanged_
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [~] 3.2 Import and configure canvas in fileParserService.js
    - Add canvas import at the top of the file: const canvas = require('canvas');
    - This makes the dependency explicit and allows early failure if canvas is not installed
    - Modify the pdfParse call in parsePdf function to include canvas in options: await pdfParse(dataBuffer, { canvas })
    - This explicitly provides the canvas implementation to pdf-parse
    - _Bug_Condition: isBugCondition(input) where input.fileExtension === '.pdf' AND pdfRequiresCanvasRendering(input.fileBuffer) AND NOT canvasLibraryAvailable()_
    - _Expected_Behavior: PDFs with embedded images or complex formatting should be successfully parsed and text extracted_
    - _Preservation: Simple text-based PDFs, DOCX parsing, error handling for unsupported file types, file existence validation, and error messages for PDFs with no readable text must remain unchanged_
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [~] 3.3 Add enhanced error handling for canvas-related failures
    - Wrap pdfParse call in try-catch to catch canvas-specific errors
    - Provide clearer error messages for canvas-related failures
    - Help users understand if the issue is canvas-related vs PDF corruption
    - Preserve existing error handling for other failure modes
    - _Bug_Condition: isBugCondition(input) where input.fileExtension === '.pdf' AND pdfRequiresCanvasRendering(input.fileBuffer) AND NOT canvasLibraryAvailable()_
    - _Expected_Behavior: PDFs with embedded images or complex formatting should be successfully parsed and text extracted_
    - _Preservation: Simple text-based PDFs, DOCX parsing, error handling for unsupported file types, file existence validation, and error messages for PDFs with no readable text must remain unchanged_
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [~] 3.4 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Complex PDF Parsing Success
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - Verify PDFs with embedded images parse successfully
    - Verify PDFs with complex formatting parse successfully
    - Verify PDFs from design tools parse successfully
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3_

  - [~] 3.5 Verify preservation tests still pass
    - **Property 2: Preservation** - Simple PDF and DOCX Parsing
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - Verify simple text-based PDFs produce identical output
    - Verify DOCX parsing is completely unaffected
    - Verify error handling for invalid files remains unchanged
    - Verify error handling for unsupported file types remains unchanged
    - Verify error messages for empty content remain unchanged
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

- [~] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
