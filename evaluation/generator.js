const skills = require("./skill_pool.json").skills;

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function randomSkills(count) {
    const shuffled = [...skills].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function generateResume() {
    return {
        skills: randomSkills(randomInt(3, 10))
    };
}

function generateJob() {
    return {
        skills: randomSkills(randomInt(3, 8))
    };
}

module.exports = {
    generateResume,
    generateJob
};