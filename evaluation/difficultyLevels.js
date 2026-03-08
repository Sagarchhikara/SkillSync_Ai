const { matchSkills } = require("./matcherTester");
const domains = require("./skill_domains.json");
const synonyms = require("./skill_synonyms.json");

function randomDomain() {
    const keys = Object.keys(domains);
    return keys[Math.floor(Math.random() * keys.length)];
}

function randomSkillsFromDomain(domain, count) {
    const skills = domains[domain];
    const shuffled = [...skills].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, skills.length));
}

// Level 1: Easy - Exact matches
function generateEasyTest() {
    const domain = randomDomain();
    const jobSkills = randomSkillsFromDomain(domain, 4);
    const resumeSkills = [...jobSkills, ...randomSkillsFromDomain(domain, 2)];
    
    return {
        difficulty: "Easy",
        expectedScore: 100,
        job: { skills: jobSkills },
        resume: { skills: resumeSkills },
        description: "Exact skill matches"
    };
}

// Level 2: Medium - Partial overlap
function generateMediumTest() {
    const domain = randomDomain();
    const jobSkills = randomSkillsFromDomain(domain, 5);
    const matchCount = Math.floor(jobSkills.length * 0.6);
    const resumeSkills = [
        ...jobSkills.slice(0, matchCount),
        ...randomSkillsFromDomain(domain, 3)
    ];
    
    return {
        difficulty: "Medium",
        expectedScore: 60,
        job: { skills: jobSkills },
        resume: { skills: resumeSkills },
        description: "Partial overlap (60%)"
    };
}

// Level 3: Hard - Synonyms + missing skills
function generateHardTest() {
    const domain = randomDomain();
    const jobSkills = randomSkillsFromDomain(domain, 4);
    
    // Replace some skills with synonyms
    const resumeSkills = jobSkills.map((skill, idx) => {
        if (idx < 2) {
            // Try to find synonym
            const group = synonyms.synonymGroups.find(g => 
                g.some(s => s.toLowerCase() === skill.toLowerCase())
            );
            if (group && group.length > 1) {
                return group[1]; // Use synonym
            }
        }
        return skill;
    });
    
    // Add some extra skills
    resumeSkills.push(...randomSkillsFromDomain(domain, 2));
    
    return {
        difficulty: "Hard",
        expectedScore: 50, // Lower because synonyms might not match
        job: { skills: jobSkills },
        resume: { skills: resumeSkills },
        description: "Synonyms + missing skills"
    };
}

// Level 4: Extreme - Noisy resume text
function generateExtremeTest() {
    const domain = randomDomain();
    const jobSkills = randomSkillsFromDomain(domain, 4);
    
    // Create noisy text with skills embedded
    const noisyText = `Experienced developer with ${jobSkills[0]} and ${jobSkills[1]}. 
    Also worked with various technologies including ${jobSkills[2]}.
    Strong background in software development.`;
    
    // Simple extraction (in real system, this would use NLP)
    const extractedSkills = jobSkills.slice(0, 3);
    
    return {
        difficulty: "Extreme",
        expectedScore: 75,
        job: { skills: jobSkills },
        resume: { skills: extractedSkills },
        resumeText: noisyText,
        description: "Noisy resume text extraction"
    };
}

// Run difficulty level tests
function runDifficultyTests(testsPerLevel = 50) {
    const levels = [
        { name: "Easy", generator: generateEasyTest },
        { name: "Medium", generator: generateMediumTest },
        { name: "Hard", generator: generateHardTest },
        { name: "Extreme", generator: generateExtremeTest }
    ];
    
    const results = {};
    
    levels.forEach(({ name, generator }) => {
        const levelResults = [];
        
        for (let i = 0; i < testsPerLevel; i++) {
            const test = generator();
            const result = matchSkills(test.resume.skills, test.job.skills);
            
            levelResults.push({
                expectedScore: test.expectedScore,
                actualScore: result.score,
                deviation: Math.abs(test.expectedScore - result.score)
            });
        }
        
        const avgScore = levelResults.reduce((sum, r) => sum + r.actualScore, 0) / testsPerLevel;
        const avgDeviation = levelResults.reduce((sum, r) => sum + r.deviation, 0) / testsPerLevel;
        const passRate = levelResults.filter(r => r.deviation < 20).length / testsPerLevel * 100;
        
        results[name] = {
            tests: testsPerLevel,
            averageScore: avgScore.toFixed(2),
            expectedScore: levelResults[0].expectedScore,
            averageDeviation: avgDeviation.toFixed(2),
            passRate: passRate.toFixed(2)
        };
    });
    
    return results;
}

module.exports = {
    generateEasyTest,
    generateMediumTest,
    generateHardTest,
    generateExtremeTest,
    runDifficultyTests
};
