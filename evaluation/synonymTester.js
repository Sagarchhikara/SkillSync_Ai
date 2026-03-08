const synonyms = require("./skill_synonyms.json");

function findSynonymGroup(skill) {
    const normalized = skill.toLowerCase().trim();
    return synonyms.synonymGroups.find(group => 
        group.some(s => s.toLowerCase() === normalized)
    );
}

function areSynonyms(skill1, skill2) {
    const group = findSynonymGroup(skill1);
    if (!group) return false;
    
    const normalized2 = skill2.toLowerCase().trim();
    return group.some(s => s.toLowerCase() === normalized2);
}

function generateSynonymTest() {
    const randomGroup = synonyms.synonymGroups[
        Math.floor(Math.random() * synonyms.synonymGroups.length)
    ];
    
    const skill1 = randomGroup[0];
    const skill2 = randomGroup[Math.floor(Math.random() * randomGroup.length)];
    
    return {
        scenario: "Synonym Test",
        synonymGroup: randomGroup,
        job: { skills: [skill1] },
        resume: { skills: [skill2] },
        expectedMatch: true,
        description: `Testing if "${skill1}" matches "${skill2}"`
    };
}

function testSynonymMatching(matchFunction) {
    const results = [];
    
    synonyms.synonymGroups.forEach(group => {
        for (let i = 0; i < group.length; i++) {
            for (let j = i + 1; j < group.length; j++) {
                const skill1 = group[i];
                const skill2 = group[j];
                
                const result = matchFunction([skill2], [skill1]);
                const matched = result.matched.length > 0;
                
                results.push({
                    skill1,
                    skill2,
                    matched,
                    expected: true,
                    passed: matched === true
                });
            }
        }
    });
    
    return results;
}

module.exports = {
    areSynonyms,
    generateSynonymTest,
    testSynonymMatching,
    findSynonymGroup
};
