function matchSkills(resumeSkills, jobSkills) {
    const resumeSet = new Set(resumeSkills);

    let matched = [];
    let missing = [];

    jobSkills.forEach(skill => {
        if (resumeSet.has(skill)) {
            matched.push(skill);
        } else {
            missing.push(skill);
        }
    });

    const score = (matched.length / jobSkills.length) * 100;

    return {
        matched,
        missing,
        score
    };
}

module.exports = { matchSkills };