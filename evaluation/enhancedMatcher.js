// Enhanced Skill Matcher with Normalization, Nonlinear Scoring, and Weighting

// Fix #1: Comprehensive Synonym Map
const synonymMap = {
    // React ecosystem
    "reactjs": "react",
    "react.js": "react",
    "react js": "react",
    
    // Node.js ecosystem
    "nodejs": "node.js",
    "node js": "node.js",
    "node": "node.js",
    
    // Express
    "expressjs": "express",
    "express.js": "express",
    
    // Vue
    "vuejs": "vue",
    "vue.js": "vue",
    
    // Angular
    "angularjs": "angular",
    
    // Kubernetes
    "k8s": "kubernetes",
    "kube": "kubernetes",
    
    // Machine Learning
    "ml": "machine learning",
    "machine-learning": "machine learning",
    
    // Artificial Intelligence
    "ai": "artificial intelligence",
    
    // Databases
    "postgres": "postgresql",
    "mongo": "mongodb",
    "mongodb": "mongodb",
    
    // JavaScript
    "js": "javascript",
    
    // TypeScript
    "ts": "typescript",
    
    // Python
    "py": "python",
    
    // Spring Boot
    "springboot": "spring boot",
    "spring-boot": "spring boot",
    
    // React Native
    "reactnative": "react native",
    "react-native": "react native",
    
    // Next.js
    "nextjs": "next.js",
    
    // Scikit-learn
    "sklearn": "scikit-learn",
    "scikit learn": "scikit-learn",
    
    // Natural Language Processing
    "nlp": "natural language processing",
    
    // Amazon Web Services
    "amazon web services": "aws",
    
    // Google Cloud Platform
    "google cloud": "gcp",
    "google cloud platform": "gcp"
};

// Fix #4: Skill Similarity Map (partial credit)
const similarityMap = {
    "express": { "node.js": 0.7 },
    "nextjs": { "react": 0.8 },
    "next.js": { "react": 0.8 },
    "redux": { "react": 0.6 },
    "pytorch": { "machine learning": 0.8, "tensorflow": 0.7 },
    "tensorflow": { "machine learning": 0.8, "pytorch": 0.7 },
    "keras": { "tensorflow": 0.7, "machine learning": 0.7 },
    "flask": { "python": 0.7 },
    "django": { "python": 0.7 },
    "fastapi": { "python": 0.7 },
    "spring": { "java": 0.7 },
    "spring boot": { "java": 0.7 },
    "react native": { "react": 0.8, "mobile development": 0.7 },
    "swift": { "ios": 0.8 },
    "kotlin": { "android": 0.8 },
    "docker": { "kubernetes": 0.6 },
    "kubernetes": { "docker": 0.6 },
    "postgresql": { "sql": 0.8 },
    "mysql": { "sql": 0.8 },
    "mongodb": { "nosql": 0.8 }
};

// Normalize a single skill
function normalizeSkill(skill) {
    if (!skill) return "";
    
    let normalized = skill.toLowerCase().trim();
    
    // Check synonym map
    if (synonymMap[normalized]) {
        return synonymMap[normalized];
    }
    
    return normalized;
}

// Calculate similarity between two skills
function calculateSimilarity(skill1, skill2) {
    const norm1 = normalizeSkill(skill1);
    const norm2 = normalizeSkill(skill2);
    
    // Exact match
    if (norm1 === norm2) {
        return 1.0;
    }
    
    // Check similarity map
    if (similarityMap[norm1] && similarityMap[norm1][norm2]) {
        return similarityMap[norm1][norm2];
    }
    
    if (similarityMap[norm2] && similarityMap[norm2][norm1]) {
        return similarityMap[norm2][norm1];
    }
    
    // No match
    return 0;
}

// Fix #2: Nonlinear Scoring
function calculateNonlinearScore(matched, required) {
    if (required === 0) return 100;
    
    const ratio = matched / required;
    
    // Quadratic scoring: (matched/required)² * 100
    return Math.pow(ratio, 2) * 100;
}

// Fix #3: Weighted Matching
function matchSkillsWeighted(resumeSkills, jobSkills) {
    // Normalize resume skills
    const normalizedResume = resumeSkills.map(skill => {
        if (typeof skill === 'string') {
            return { name: normalizeSkill(skill), weight: 1 };
        }
        return { name: normalizeSkill(skill.name), weight: skill.weight || 1 };
    });
    
    // Normalize job skills
    const normalizedJob = jobSkills.map(skill => {
        if (typeof skill === 'string') {
            return { name: normalizeSkill(skill), weight: 1 };
        }
        return { name: normalizeSkill(skill.name), weight: skill.weight || 1 };
    });
    
    let matchedWeight = 0;
    let totalWeight = 0;
    const matched = [];
    const missing = [];
    const partialMatches = [];
    
    normalizedJob.forEach(jobSkill => {
        totalWeight += jobSkill.weight;
        
        let bestMatch = 0;
        let matchedSkillName = null;
        
        // Find best matching resume skill
        normalizedResume.forEach(resumeSkill => {
            const similarity = calculateSimilarity(resumeSkill.name, jobSkill.name);
            if (similarity > bestMatch) {
                bestMatch = similarity;
                matchedSkillName = resumeSkill.name;
            }
        });
        
        if (bestMatch >= 1.0) {
            // Exact match
            matched.push(jobSkill.name);
            matchedWeight += jobSkill.weight;
        } else if (bestMatch > 0) {
            // Partial match
            partialMatches.push({
                required: jobSkill.name,
                found: matchedSkillName,
                similarity: bestMatch
            });
            matchedWeight += jobSkill.weight * bestMatch;
        } else {
            // No match
            missing.push(jobSkill.name);
        }
    });
    
    // Calculate score using nonlinear formula
    const linearScore = totalWeight > 0 ? (matchedWeight / totalWeight) * 100 : 0;
    const nonlinearScore = calculateNonlinearScore(matchedWeight, totalWeight);
    
    return {
        matched,
        missing,
        partialMatches,
        matchedWeight: matchedWeight.toFixed(2),
        totalWeight,
        linearScore: linearScore.toFixed(2),
        score: nonlinearScore.toFixed(2) // Use nonlinear score
    };
}

// Simple matching (for backward compatibility)
function matchSkills(resumeSkills, jobSkills) {
    // Normalize both lists
    const normalizedResume = resumeSkills.map(normalizeSkill);
    const normalizedJob = jobSkills.map(normalizeSkill);
    
    const resumeSet = new Set(normalizedResume);
    
    let exactMatches = [];
    let partialMatches = [];
    let missing = [];
    let matchScore = 0;
    
    normalizedJob.forEach(jobSkill => {
        if (resumeSet.has(jobSkill)) {
            // Exact match
            exactMatches.push(jobSkill);
            matchScore += 1;
        } else {
            // Check for partial matches
            let bestSimilarity = 0;
            let bestMatch = null;
            
            normalizedResume.forEach(resumeSkill => {
                const similarity = calculateSimilarity(resumeSkill, jobSkill);
                if (similarity > bestSimilarity) {
                    bestSimilarity = similarity;
                    bestMatch = resumeSkill;
                }
            });
            
            if (bestSimilarity > 0) {
                partialMatches.push({
                    required: jobSkill,
                    found: bestMatch,
                    similarity: bestSimilarity
                });
                matchScore += bestSimilarity;
            } else {
                missing.push(jobSkill);
            }
        }
    });
    
    // Use nonlinear scoring
    const score = calculateNonlinearScore(matchScore, normalizedJob.length);
    
    return {
        matched: exactMatches,
        partialMatches,
        missing,
        score: parseFloat(score.toFixed(2))
    };
}

module.exports = {
    normalizeSkill,
    calculateSimilarity,
    calculateNonlinearScore,
    matchSkills,
    matchSkillsWeighted,
    synonymMap,
    similarityMap
};
