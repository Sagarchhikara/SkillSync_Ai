const fs = require('fs');
const path = require('path');

// Load real resume dataset
function loadResumeDataset(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.warn(`Could not load resume dataset from ${filePath}: ${error.message}`);
        return null;
    }
}

// Load real job dataset
function loadJobDataset(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.warn(`Could not load job dataset from ${filePath}: ${error.message}`);
        return null;
    }
}

// Calculate Top-K accuracy
function calculateTopKAccuracy(rankings, k) {
    // Check if the correct match is in top K results
    const topK = rankings.slice(0, k);
    const correctMatch = rankings.find(r => r.isCorrectMatch);
    
    if (!correctMatch) return 0;
    
    return topK.includes(correctMatch) ? 100 : 0;
}

// Run evaluation on real dataset
function evaluateRealDataset(resumes, jobs, matchFunction) {
    if (!resumes || !jobs) {
        return {
            error: "Dataset not loaded",
            message: "Place real datasets in evaluation/datasets/ folder"
        };
    }
    
    // Ensure jobs is an array
    const jobsArray = Array.isArray(jobs) ? jobs : jobs.jobs || [];
    const resumesArray = Array.isArray(resumes) ? resumes : resumes.resumes || [];
    
    if (jobsArray.length === 0 || resumesArray.length === 0) {
        return {
            error: "Empty dataset",
            message: "Datasets are empty or malformed"
        };
    }
    
    const results = {
        totalResumes: resumesArray.length,
        totalJobs: jobsArray.length,
        top1Accuracy: [],
        top3Accuracy: [],
        top5Accuracy: [],
        averageScores: []
    };
    
    // For each job, rank all resumes
    jobsArray.forEach(job => {
        const rankings = resumesArray.map(resume => {
            const result = matchFunction(resume.skills, job.skills);
            return {
                resumeId: resume.id,
                score: result.score,
                matched: result.matched,
                missing: result.missing,
                isCorrectMatch: resume.targetJobId === job.id
            };
        });
        
        // Sort by score
        rankings.sort((a, b) => b.score - a.score);
        
        // Calculate top-k accuracies
        results.top1Accuracy.push(calculateTopKAccuracy(rankings, 1));
        results.top3Accuracy.push(calculateTopKAccuracy(rankings, 3));
        results.top5Accuracy.push(calculateTopKAccuracy(rankings, 5));
        
        // Average score
        const avgScore = rankings.reduce((sum, r) => sum + r.score, 0) / rankings.length;
        results.averageScores.push(avgScore);
    });
    
    return {
        totalResumes: results.totalResumes,
        totalJobs: results.totalJobs,
        top1Accuracy: (results.top1Accuracy.reduce((a, b) => a + b, 0) / results.top1Accuracy.length).toFixed(2),
        top3Accuracy: (results.top3Accuracy.reduce((a, b) => a + b, 0) / results.top3Accuracy.length).toFixed(2),
        top5Accuracy: (results.top5Accuracy.reduce((a, b) => a + b, 0) / results.top5Accuracy.length).toFixed(2),
        averageScore: (results.averageScores.reduce((a, b) => a + b, 0) / results.averageScores.length).toFixed(2)
    };
}

// Create sample dataset structure
function createSampleDataset() {
    const sampleResumes = {
        resumes: [
            {
                id: "R1",
                skills: ["react", "node.js", "mongodb", "docker"],
                targetJobId: "J1"
            },
            {
                id: "R2",
                skills: ["python", "tensorflow", "pytorch", "ml"],
                targetJobId: "J2"
            },
            {
                id: "R3",
                skills: ["java", "spring", "postgresql", "kubernetes"],
                targetJobId: "J3"
            }
        ]
    };
    
    const sampleJobs = {
        jobs: [
            {
                id: "J1",
                title: "Full Stack Developer",
                skills: ["react", "node.js", "mongodb"]
            },
            {
                id: "J2",
                title: "ML Engineer",
                skills: ["python", "tensorflow", "machine learning"]
            },
            {
                id: "J3",
                title: "Backend Engineer",
                skills: ["java", "spring boot", "postgresql"]
            }
        ]
    };
    
    return { sampleResumes, sampleJobs };
}

module.exports = {
    loadResumeDataset,
    loadJobDataset,
    calculateTopKAccuracy,
    evaluateRealDataset,
    createSampleDataset
};
