const { db } = require('../config/firebase');

const COLLECTION = 'jobs';

const Job = {
    /**
     * Creates a new job
     * @param {object} jobData 
     */
    async create(jobData) {
        const normalizedSkills = (jobData.requiredSkills || [])
            .map(skill => skill ? skill.toString().toLowerCase().trim() : '')
            .filter(skill => skill !== '');
        
        const data = {
            ...jobData,
            requiredSkills: [...new Set(normalizedSkills)],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const docRef = await db.collection(COLLECTION).add(data);
        return { _id: docRef.id, ...data };
    },

    /**
     * Finds a job by ID
     * @param {string} id 
     */
    async findById(id) {
        const doc = await db.collection(COLLECTION).doc(id).get();
        if (!doc.exists) return null;
        return { _id: doc.id, ...doc.data() };
    },

    /**
     * Get all jobs
     */
    async find() {
        const snapshot = await db.collection(COLLECTION).get();
        return snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    }
};

module.exports = Job;
