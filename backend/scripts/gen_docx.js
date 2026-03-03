const fs = require('fs');
const docx = require('docx');
const { Document, Packer, Paragraph, TextRun } = docx;

const doc = new Document({
    sections: [{
        properties: {},
        children: [
            new Paragraph({
                children: [
                    new TextRun("I have experience in Python, Javascript, Node.js, and React."),
                ],
            }),
        ],
    }],
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("perf_test.docx", buffer);
    console.log("perf_test.docx generated.");
});
