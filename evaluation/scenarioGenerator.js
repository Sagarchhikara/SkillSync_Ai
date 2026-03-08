const domains = require("./skill_domains.json");

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function randomSkillsFromDomain(domain, count) {
    const skills = domains[domain];
    const shuffled = [...skills].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, skills.length));
}

function randomSkillsFromMultipleDomains(domainList, count) {
    let allSkills = [];
    domainList.forEach(domain => {
        allSkills = allSkills.concat(domains[domain]);
    });
    const shuffled = [...allSkills].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, allSkills.length));
}

// Scenario 1: Perfect Match
function generatePerfectMatch() {
    const domainKeys = Object.keys(domains);
    const domain = domainKeys[randomInt(0, domainKeys.length)];
    const jobSkills = randomSkillsFromDomain(domain, randomInt(3, 6));
    const extraSkills = randomSkillsFromDomain(domain, randomInt(2, 4));
    
    return {
        scenario: "Perfect Match",
        expectedScore: 100,
        job: { skills: jobSkills },
        resume: { skills: [...jobSkills, ...extraSkills] }
    };
}

// Scenario 2: Strong Match (70-90%)
function generateStrongMatch() {
    const domainKeys = Object.keys(domains);
    const domain = domainKeys[randomInt(0, domainKeys.length)];
    const jobSkills = randomSkillsFromDomain(domain, randomInt(5, 8));
    const matchCount = Math.floor(jobSkills.length * 0.75);
    const matchedSkills = jobSkills.slice(0, matchCount);
    const extraSkills = randomSkillsFromDomain(domain, randomInt(2, 4));
    
    return {
        scenario: "Strong Match",
        expectedScore: 75,
        job: { skills: jobSkills },
        resume: { skills: [...matchedSkills, ...extraSkills] }
    };
}

// Scenario 3: Partial Match (40-60%)
function generatePartialMatch() {
    const domainKeys = Object.keys(domains);
    const domain = domainKeys[randomInt(0, domainKeys.length)];
    const jobSkills = randomSkillsFromDomain(domain, randomInt(5, 8));
    const matchCount = Math.floor(jobSkills.length * 0.5);
    const matchedSkills = jobSkills.slice(0, matchCount);
    const extraSkills = randomSkillsFromDomain(domain, randomInt(3, 5));
    
    return {
        scenario: "Partial Match",
        expectedScore: 50,
        job: { skills: jobSkills },
        resume: { skills: [...matchedSkills, ...extraSkills] }
    };
}

// Scenario 4: Weak Match (10-30%)
function generateWeakMatch() {
    const domainKeys = Object.keys(domains);
    const domain = domainKeys[randomInt(0, domainKeys.length)];
    const jobSkills = randomSkillsFromDomain(domain, randomInt(5, 8));
    const matchCount = Math.floor(jobSkills.length * 0.2);
    const matchedSkills = jobSkills.slice(0, matchCount);
    const extraSkills = randomSkillsFromDomain(domain, randomInt(4, 6));
    
    return {
        scenario: "Weak Match",
        expectedScore: 20,
        job: { skills: jobSkills },
        resume: { skills: [...matchedSkills, ...extraSkills] }
    };
}

// Scenario 5: No Match (Cross-domain)
function generateNoMatch() {
    const domainKeys = Object.keys(domains);
    const domain1 = domainKeys[randomInt(0, domainKeys.length)];
    let domain2 = domainKeys[randomInt(0, domainKeys.length)];
    
    // Ensure different domains
    while (domain2 === domain1) {
        domain2 = domainKeys[randomInt(0, domainKeys.length)];
    }
    
    const jobSkills = randomSkillsFromDomain(domain1, randomInt(4, 7));
    const resumeSkills = randomSkillsFromDomain(domain2, randomInt(4, 7));
    
    return {
        scenario: "No Match (Cross-domain)",
        expectedScore: 0,
        job: { skills: jobSkills },
        resume: { skills: resumeSkills }
    };
}

// Scenario 6: Multi-domain Match
function generateMultiDomainMatch() {
    const domainKeys = Object.keys(domains);
    const selectedDomains = [
        domainKeys[randomInt(0, domainKeys.length)],
        domainKeys[randomInt(0, domainKeys.length)]
    ];
    
    const jobSkills = randomSkillsFromMultipleDomains(selectedDomains, randomInt(5, 8));
    const matchCount = Math.floor(jobSkills.length * 0.6);
    const matchedSkills = jobSkills.slice(0, matchCount);
    const extraSkills = randomSkillsFromMultipleDomains(selectedDomains, randomInt(2, 4));
    
    return {
        scenario: "Multi-domain Match",
        expectedScore: 60,
        job: { skills: jobSkills },
        resume: { skills: [...matchedSkills, ...extraSkills] }
    };
}

module.exports = {
    generatePerfectMatch,
    generateStrongMatch,
    generatePartialMatch,
    generateWeakMatch,
    generateNoMatch,
    generateMultiDomainMatch
};
