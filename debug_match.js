const { calculateMatch } = require('./backend/src/services/matchService.js');

async function test() {
    console.log("Starting match test...");
    const resume = ['java', 'spring', 'aws', 'docker'];
    const required = ['java', 'spring', 'aws'];
    try {
        const result = await calculateMatch(resume, required);
        console.log("Result:", result);
    } catch (err) {
        console.error("Error:", err);
    }
    console.log("Finished test.");
}
test();
