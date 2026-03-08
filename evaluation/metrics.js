function calculateMetrics(results) {
    let totalTests = results.length;

    let perfectMatches = 0;
    let zeroMatches = 0;
    let averageScore = 0;

    results.forEach(r => {
        averageScore += r.score;

        if (r.score === 100) perfectMatches++;
        if (r.score === 0) zeroMatches++;
    });

    return {
        totalTests,
        perfectMatches,
        zeroMatches,
        averageScore: averageScore / totalTests
    };
}

module.exports = { calculateMetrics };