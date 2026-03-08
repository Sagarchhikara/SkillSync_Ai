const { runScenarioTests } = require("./comprehensiveEvaluation");
const { runRankingBenchmark } = require("./rankingBenchmark");
const { runDifficultyTests } = require("./difficultyLevels");
const { calculateComprehensiveMetrics } = require("./advancedMetrics");
const { testSynonymMatching } = require("./synonymTester");
const { testNoiseExtraction } = require("./noiseTester");
const { matchSkills } = require("./matcherTester");
const { 
    loadResumeDataset, 
    loadJobDataset, 
    evaluateRealDataset,
    createSampleDataset 
} = require("./realDatasetLoader");
const path = require("path");

console.log("╔" + "═".repeat(78) + "╗");
console.log("║" + " ".repeat(20) + "ULTIMATE EVALUATION SUITE" + " ".repeat(33) + "║");
console.log("╚" + "═".repeat(78) + "╝");
console.log();

// 1. RANKING BENCHMARKS
console.log("📊 1. RANKING BENCHMARKS");
console.log("─".repeat(80));
const rankingResults = runRankingBenchmark(100);
console.log(`Total Tests: ${rankingResults.totalTests}`);
console.log(`Average Ranking Accuracy: ${rankingResults.averageAccuracy}%`);
console.log(`Perfect Rankings: ${rankingResults.perfectRankings} (${rankingResults.perfectRankingRate}%)`);
console.log("\nSample Ranking Test:");
const sample = rankingResults.sampleResults[0];
console.log(`  Expected Order: ${sample.expectedOrder.join(" > ")}`);
console.log(`  Actual Order:   ${sample.actualOrder.join(" > ")}`);
console.log(`  Accuracy: ${sample.accuracy.toFixed(2)}%`);
console.log(`  Scores: ${sample.scores.map(s => `${s.id}:${s.score.toFixed(0)}%`).join(", ")}`);

// 2. DIFFICULTY LEVELS
console.log("\n\n🎯 2. DIFFICULTY LEVEL TESTS");
console.log("─".repeat(80));
const difficultyResults = runDifficultyTests(50);
Object.entries(difficultyResults).forEach(([level, data]) => {
    console.log(`\n${level} Level:`);
    console.log(`  Tests: ${data.tests}`);
    console.log(`  Expected Score: ${data.expectedScore}%`);
    console.log(`  Average Score: ${data.averageScore}%`);
    console.log(`  Average Deviation: ${data.averageDeviation}%`);
    console.log(`  Pass Rate (<20% deviation): ${data.passRate}%`);
});

// 3. ADVANCED METRICS
console.log("\n\n📈 3. ADVANCED METRICS (Precision, Recall, F1)");
console.log("─".repeat(80));

// Generate test cases for metrics
const {
    generatePerfectMatch,
    generateStrongMatch,
    generatePartialMatch
} = require("./scenarioGenerator");

const metricsTests = [];
for (let i = 0; i < 30; i++) {
    metricsTests.push(generatePerfectMatch());
    metricsTests.push(generateStrongMatch());
    metricsTests.push(generatePartialMatch());
}

const metricsResults = calculateComprehensiveMetrics(metricsTests);
console.log(`Total Tests: ${metricsResults.totalTests}`);
console.log(`Average Precision: ${metricsResults.averagePrecision}%`);
console.log(`Average Recall: ${metricsResults.averageRecall}%`);
console.log(`Average F1 Score: ${metricsResults.averageF1Score}%`);

// 4. SEMANTIC ACCURACY (Synonyms)
console.log("\n\n🔤 4. SEMANTIC ACCURACY (Synonym Matching)");
console.log("─".repeat(80));
const synonymResults = testSynonymMatching(matchSkills);
const synonymPassed = synonymResults.filter(r => r.passed).length;
const synonymTotal = synonymResults.length;
const synonymAccuracy = ((synonymPassed / synonymTotal) * 100).toFixed(2);

console.log(`Total Synonym Tests: ${synonymTotal}`);
console.log(`Passed: ${synonymPassed}`);
console.log(`Failed: ${synonymTotal - synonymPassed}`);
console.log(`Semantic Accuracy: ${synonymAccuracy}%`);

if (synonymPassed === 0) {
    console.log("\n⚠️  WARNING: 0% synonym matching! System cannot recognize skill variations.");
    console.log("   Examples that failed:");
    synonymResults.slice(0, 5).forEach(r => {
        console.log(`   - "${r.skill1}" ↔ "${r.skill2}"`);
    });
}

// 5. NOISE EXTRACTION
console.log("\n\n🔍 5. NOISE EXTRACTION TESTS");
console.log("─".repeat(80));
const noiseResults = testNoiseExtraction();
const avgSkills = (noiseResults.reduce((sum, r) => sum + r.skillCount, 0) / noiseResults.length).toFixed(2);
console.log(`Total Texts: ${noiseResults.length}`);
console.log(`Texts with Skills: ${noiseResults.filter(r => r.passed).length}`);
console.log(`Average Skills Extracted: ${avgSkills}`);

// 6. REAL DATASET EVALUATION
console.log("\n\n💾 6. REAL DATASET EVALUATION");
console.log("─".repeat(80));

const resumesPath = path.join(__dirname, "datasets", "resumes.json");
const jobsPath = path.join(__dirname, "datasets", "jobs.json");

let realResumes = loadResumeDataset(resumesPath);
let realJobs = loadJobDataset(jobsPath);

if (!realResumes || !realJobs) {
    console.log("⚠️  No real datasets found. Using sample data...");
    const { sampleResumes, sampleJobs } = createSampleDataset();
    realResumes = sampleResumes.resumes;
    realJobs = sampleJobs.jobs;
}

const realDataResults = evaluateRealDataset(realResumes, realJobs, matchSkills);

if (realDataResults.error) {
    console.log(`Status: ${realDataResults.message}`);
    console.log("Place resumes.json and jobs.json in evaluation/datasets/ for real data testing");
} else {
    console.log(`Total Resumes: ${realDataResults.totalResumes}`);
    console.log(`Total Jobs: ${realDataResults.totalJobs}`);
    console.log(`Top-1 Accuracy: ${realDataResults.top1Accuracy}%`);
    console.log(`Top-3 Accuracy: ${realDataResults.top3Accuracy}%`);
    console.log(`Top-5 Accuracy: ${realDataResults.top5Accuracy}%`);
    console.log(`Average Match Score: ${realDataResults.averageScore}%`);
}

// SUMMARY REPORT
console.log("\n\n" + "╔" + "═".repeat(78) + "╗");
console.log("║" + " ".repeat(28) + "SUMMARY REPORT" + " ".repeat(36) + "║");
console.log("╚" + "═".repeat(78) + "╝");

console.log("\n✅ STRENGTHS:");
if (parseFloat(rankingResults.averageAccuracy) > 80) {
    console.log(`  • Ranking Accuracy: ${rankingResults.averageAccuracy}% (Excellent)`);
}
if (parseFloat(metricsResults.averageF1Score) > 70) {
    console.log(`  • F1 Score: ${metricsResults.averageF1Score}% (Good)`);
}
if (parseFloat(difficultyResults.Easy.passRate) > 90) {
    console.log(`  • Easy Tests: ${difficultyResults.Easy.passRate}% pass rate`);
}

console.log("\n❌ CRITICAL ISSUES:");
if (parseFloat(synonymAccuracy) < 10) {
    console.log(`  • Synonym Matching: ${synonymAccuracy}% (CRITICAL - Must fix)`);
}
if (parseFloat(difficultyResults.Hard.passRate) < 50) {
    console.log(`  • Hard Tests: ${difficultyResults.Hard.passRate}% pass rate (Needs improvement)`);
}
if (parseFloat(rankingResults.averageAccuracy) < 70) {
    console.log(`  • Ranking Accuracy: ${rankingResults.averageAccuracy}% (Below target)`);
}

console.log("\n📋 RECOMMENDATIONS:");
console.log("  1. Implement synonym normalization (0% pass rate is critical)");
console.log("  2. Add fuzzy matching for skill variations");
console.log("  3. Improve ranking algorithm for better candidate ordering");
console.log("  4. Test with real datasets (place in evaluation/datasets/)");
console.log("  5. Consider skill importance weighting");

console.log("\n" + "═".repeat(80));
console.log("Evaluation complete! Results saved to evaluation/ultimate_results.txt");
console.log("═".repeat(80));
