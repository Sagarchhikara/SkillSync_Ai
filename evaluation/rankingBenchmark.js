const { matchSkills } = require("./matcherTester");

// Generate ranking test cases
function generateRankingTest() {
    const domains = require("./skill_domains.json");
    const allDomains = Object.keys(domains);
    const selectedDomain = allDomains[Math.floor(Math.random() * allDomains.length)];
    const jobSkills = domains[selectedDomain].slice(0, 4);
    
    // Create candidates with different match levels
    const candidates = [
        {
            id: "A",
            skills: [...jobSkills], // Perfect match
            expectedRank: 1
        },
        {
            id: "B",
            skills: [...jobSkills.slice(0, 3), domains[selectedDomain][4]], // Strong match
            expectedRank: 2
        },
        {
            id: "C",
            skills: [...jobSkills.slice(0, 2), domains[selectedDomain][5], domains[selectedDomain][6]], // Partial match
            expectedRank: 3
        },
        {
            id: "D",
            skills: jobSkills.slice(0, 1).concat(domains[selectedDomain].slice(5, 8)), // Weak match
            expectedRank: 4
        }
    ];
    
    // Shuffle to test ranking algorithm
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    
    return {
        job: { skills: jobSkills },
        candidates: shuffled,
        expectedOrder: ["A", "B", "C", "D"]
    };
}

// Rank candidates for a job
function rankCandidates(job, candidates) {
    const scored = candidates.map(candidate => {
        const result = matchSkills(candidate.skills, job.skills);
        return {
            ...candidate,
            score: result.score,
            matched: result.matched,
            missing: result.missing
        };
    });
    
    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);
    
    return scored;
}

// Calculate ranking accuracy
function calculateRankingAccuracy(expectedOrder, actualOrder) {
    let correctPairs = 0;
    let totalPairs = 0;
    
    // Check all pairs - if A should rank higher than B, does it?
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
    
    return (correctPairs / totalPairs) * 100;
}

// Run ranking benchmark
function runRankingBenchmark(testCount = 100) {
    const results = [];
    
    for (let i = 0; i < testCount; i++) {
        const test = generateRankingTest();
        const ranked = rankCandidates(test.job, test.candidates);
        const actualOrder = ranked.map(c => c.id);
        
        const accuracy = calculateRankingAccuracy(test.expectedOrder, actualOrder);
        
        results.push({
            expectedOrder: test.expectedOrder,
            actualOrder,
            accuracy,
            scores: ranked.map(c => ({ id: c.id, score: c.score }))
        });
    }
    
    const avgAccuracy = results.reduce((sum, r) => sum + r.accuracy, 0) / testCount;
    const perfectRankings = results.filter(r => r.accuracy === 100).length;
    
    return {
        totalTests: testCount,
        averageAccuracy: avgAccuracy.toFixed(2),
        perfectRankings,
        perfectRankingRate: ((perfectRankings / testCount) * 100).toFixed(2),
        sampleResults: results.slice(0, 3)
    };
}

module.exports = {
    generateRankingTest,
    rankCandidates,
    calculateRankingAccuracy,
    runRankingBenchmark
};
