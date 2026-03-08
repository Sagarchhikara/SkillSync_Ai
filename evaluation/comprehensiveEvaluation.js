const {
    generatePerfectMatch,
    generateStrongMatch,
    generatePartialMatch,
    generateWeakMatch,
    generateNoMatch,
    generateMultiDomainMatch
} = require("./scenarioGenerator");

const { matchSkills } = require("./matcherTester");
const { testSynonymMatching } = require("./synonymTester");
const { testNoiseExtraction } = require("./noiseTester");

// Run structured scenario tests
function runScenarioTests() {
    const scenarios = [
        { name: "Perfect Match", generator: generatePerfectMatch, count: 100 },
        { name: "Strong Match", generator: generateStrongMatch, count: 100 },
        { name: "Partial Match", generator: generatePartialMatch, count: 100 },
        { name: "Weak Match", generator: generateWeakMatch, count: 100 },
        { name: "No Match", generator: generateNoMatch, count: 100 },
        { name: "Multi-domain", generator: generateMultiDomainMatch, count: 100 }
    ];

    const results = {};

    scenarios.forEach(({ name, generator, count }) => {
        const scenarioResults = [];
        
        for (let i = 0; i < count; i++) {
            const test = generator();
            const result = matchSkills(test.resume.skills, test.job.skills);
            
            scenarioResults.push({
                expectedScore: test.expectedScore,
                actualScore: result.score,
                deviation: Math.abs(test.expectedScore - result.score)
            });
        }

        const avgScore = scenarioResults.reduce((sum, r) => sum + r.actualScore, 0) / count;
        const avgDeviation = scenarioResults.reduce((sum, r) => sum + r.deviation, 0) / count;
        
        results[name] = {
            count,
            averageScore: avgScore.toFixed(2),
            averageDeviation: avgDeviation.toFixed(2),
            expectedScore: scenarioResults[0].expectedScore
        };
    });

    return results;
}

// Run synonym tests
function runSynonymTests() {
    const results = testSynonymMatching(matchSkills);
    
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    const passRate = ((passed / total) * 100).toFixed(2);
    
    return {
        total,
        passed,
        failed: total - passed,
        passRate: passRate + "%",
        details: results.slice(0, 5) // Show first 5 examples
    };
}

// Run noise extraction tests
function runNoiseTests() {
    const results = testNoiseExtraction();
    
    const totalSkills = results.reduce((sum, r) => sum + r.skillCount, 0);
    const avgSkills = (totalSkills / results.length).toFixed(2);
    const passed = results.filter(r => r.passed).length;
    
    return {
        totalTexts: results.length,
        textsWithSkills: passed,
        averageSkillsExtracted: avgSkills,
        details: results.map(r => ({
            text: r.text.substring(0, 50) + "...",
            skillCount: r.skillCount,
            skills: r.extractedSkills
        }))
    };
}

// Main evaluation
console.log("=".repeat(60));
console.log("COMPREHENSIVE EVALUATION REPORT");
console.log("=".repeat(60));
console.log();

console.log("1. STRUCTURED SCENARIO TESTS");
console.log("-".repeat(60));
const scenarioResults = runScenarioTests();
Object.entries(scenarioResults).forEach(([scenario, data]) => {
    console.log(`\n${scenario}:`);
    console.log(`  Tests: ${data.count}`);
    console.log(`  Expected Score: ${data.expectedScore}%`);
    console.log(`  Average Score: ${data.averageScore}%`);
    console.log(`  Average Deviation: ${data.averageDeviation}%`);
});

console.log("\n\n2. SYNONYM MATCHING TESTS");
console.log("-".repeat(60));
const synonymResults = runSynonymTests();
console.log(`Total Tests: ${synonymResults.total}`);
console.log(`Passed: ${synonymResults.passed}`);
console.log(`Failed: ${synonymResults.failed}`);
console.log(`Pass Rate: ${synonymResults.passRate}`);
console.log("\nExample Tests:");
synonymResults.details.forEach(d => {
    console.log(`  "${d.skill1}" ↔ "${d.skill2}": ${d.passed ? "✓ PASS" : "✗ FAIL"}`);
});

console.log("\n\n3. NOISE EXTRACTION TESTS");
console.log("-".repeat(60));
const noiseResults = runNoiseTests();
console.log(`Total Texts: ${noiseResults.totalTexts}`);
console.log(`Texts with Skills: ${noiseResults.textsWithSkills}`);
console.log(`Average Skills Extracted: ${noiseResults.averageSkillsExtracted}`);
console.log("\nExamples:");
noiseResults.details.forEach(d => {
    console.log(`\n  Text: "${d.text}"`);
    console.log(`  Extracted (${d.skillCount}): ${d.skills.join(", ")}`);
});

console.log("\n" + "=".repeat(60));
console.log("EVALUATION COMPLETE");
console.log("=".repeat(60));

module.exports = {
    runScenarioTests,
    runSynonymTests,
    runNoiseTests
};
