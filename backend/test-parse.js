const path = require('path');
const { parseResumeFile } = require('./src/services/fileParserService');

async function test() {
  const filePath = path.join(__dirname, '../uploads/resume-1772794780526-379231228.pdf');
  console.log('Testing parsing of:', filePath);
  try {
    const text = await parseResumeFile(filePath);
    console.log('Success. Text length:', text.length);
    console.log('Sample:', text.substring(0, 100));
  } catch (error) {
    console.error('Error parsing:', error);
  }
}

test();
