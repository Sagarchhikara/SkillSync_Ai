const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('test_resume.pdf'));

doc.text('Sagar Chhikara');
doc.text('Node.js backend developer.');
doc.text('Experience in JavaScript, React, Node.js, Express, and MongoDB.');

doc.end();
console.log('PDF created successfully!');
