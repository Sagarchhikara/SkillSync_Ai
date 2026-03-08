const { matchSkills } = require("./matcherTester");

// Calculate Precision: correct_matches / predicted_matches
function calculatePrecision(predicted, actual) {
    if (predicted.length === 0) return 0;
    
    const correctMatches = predicted.filter(skill => 
        actual.includes(skill)
    ).length;
    
    return (correctMatches / predicted.length) * 100;
}

// Calculate Recall: correct_matches / actual_matches
function calculateRecall(predicted, actual) {
    if (actual.length === 0) return 0;
    
    const correctMatches = predicted.filter(skill => 
        actual.includes(skill)
    ).length;
    
    return (correctMatches / actual.length) * 100;
}

// Calculate F1 Score: harmonic mean of precision and recall
function calculateF1Score(precision, recall) {
    if (precision + recall === 0) return 0;
    return (2 * precision * recall) / (precision + recall);
}

// Calculate Ranking Accuracy
function calculateRankingAccuracy(expectedOrder, actualOrder) {
    let correctPairs = 0;
    let totalPairs = 0;
    
    for (let i = 0; i < expectedOrder.length; i++) {
        for (let j = i + 1; j < expectedOrder.length; j++) {
            totalPairs++;
            
            const expectedHigher = expectedOrder[i];
            const expectedLower = expectedOrder[j];
            
            const actualHigherIndex = actualOrder.indexOf(expectedHigher);
            const actualLowerIndex = actualOrder.indexOf(expectedLower);
            
            if (actualHigherIndex < actualLowerIndex) {
                correctPairs++;
            }
        }
    }
    
    return totalPairs > 0 ? (correctPairs / totalPairs) * 100 : 0;
}

// Calculate Semantic Accuracy (synonym matching)
function calculateSemanticAccuracy(synonymTests) {
    const correctMatches = synonymTests.filter(test => test.passed).length;
    return (correctMatches / synonymTests.length) * 100;
}

// Calculate NDCG (Normalized Discounted Cumulative Gain)
function calculateNDCG(actualScores, idealScores, k = null) {
    const n = k || actualScores.length;
    
    const dcg = actualScores.slice(0, n).reduce((sum, score, i) => {
        return sum + score / Math.log2(i + 2);
    }, 0);
    
    const idcg = idealScores.slice(0, n).reduce((sum, score, i) => {
        return sum + score / Math.log2(i + 2);
    }, 0);
    
    return idcg > 0 ? (dcg / idcg) * 100 : 0;
}

// Calculate Mean Reciprocal Rank (MRR)
function calculateMRR(rankings) {
    const reciprocalRanks = rankings.map(rank => 1 / rank);
    const sum = reciprocalRanks.reduce((a, b) => a + b, 0);
    return (sum / rankings.length) * 100;
}

// Comprehensive metrics calculation
function calculateComprehensiveMetrics(testResults) {
    const precisions = [];
    const recalls = [];
    const f1Scores = [];
    
    testResults.forEach(test => {
        const result = matchSkills(test.resume.skills, test.job.skills);
        
        const precision = calculatePrecision(result.matched, test.job.skills);
        const recall = calculateRecall(result.matched, test.job.skills);
        const f1 = calculateF1Score(precision, recall);
        
        precisions.push(precision);
        recalls.push(recall);
        f1Scores.push(f1);
    });
    
    return {
        averagePrecision: (precisions.reduce((a, b) => a + b, 0) / precisions.length).toFixed(2),
        averageRecall: (recalls.reduce((a, b) => a + b, 0) / recalls.length).toFixed(2),
        averageF1Score: (f1Scores.reduce((a, b) => a + b, 0) / f1Scores.length).toFixed(2),
        totalTests: testResults.length
    };
}

module.exports = {
    calculatePrecision,
    calculateRecall,
    calculateF1Score,
    calculateRankingAccuracy,
    calculateSemanticAccuracy,
    calculateNDCG,
    calculateMRR,
    calculateComprehensiveMetrics
};
