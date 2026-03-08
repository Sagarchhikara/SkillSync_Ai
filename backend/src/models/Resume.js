const { db } = require('../config/firebase');

const COLLECTION = 'resumes';

const Resume = {
    /**
     * Creates a new resume entry
     * @param {object} resumeData 
     */
    async create(resumeData) {
        const data = {
            ...resumeData,
            skills: (resumeData.skills || []).map(s => s.toLowerCase().trim()),
            uploadedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const docRef = await db.collection(COLLECTION).add(data);
        return { _id: docRef.id, ...data };
    },

    /**
     * Finds a resume by ID
     * @param {string} id 
     */
    async findById(id) {
        const doc = await db.collection(COLLECTION).doc(id).get();
        if (!doc.exists) return null;
        return { _id: doc.id, ...doc.data() };
    },

    /**
     * Find resumes with query
     * @param {object} query 
     * @param {object} options 
     */
    async findOne(query, options = {}) {
        let q = db.collection(COLLECTION);
        
        if (query._id) return this.findById(query._id);
        
        if (query.userId) q = q.where('userId', '==', query.userId);
        
        if (options.sort) {
            // Firestore sorting requires index
            const field = Object.keys(options.sort)[0];
            const direction = options.sort[field] === -1 ? 'desc' : 'asc';
            q = q.orderBy(field, direction);
        }
        
        const snapshot = await q.limit(1).get();
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { _id: doc.id, ...doc.data() };
    }
};

module.exports = Resume;
