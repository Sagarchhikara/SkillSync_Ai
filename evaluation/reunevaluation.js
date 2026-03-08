const { generateResume, generateJob } = require("./generator");
const { matchSkills } = require("./matcherTester");
const { calculateMetrics } = require("./metrics");

const TEST_COUNT = 1000;

let results = [];

for (let i = 0; i < TEST_COUNT; i++) {

    const resume = generateResume();
    const job = generateJob();

    const result = matchSkills(resume.skills, job.skills);

    results.push(result);
}

const metrics = calculateMetrics(results);

console.log("Evaluation Report");
console.log("=================");
console.log(metrics);