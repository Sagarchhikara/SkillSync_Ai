const { db } = require('../config/firebase');

const COLLECTION = 'users';

const User = {
    /**
     * Finds a user by email
     * @param {string} email 
     */
    async findOne({ email }) {
        const snapshot = await db.collection(COLLECTION).where('email', '==', email.toLowerCase()).limit(1).get();
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { _id: doc.id, ...doc.data() };
    },

    /**
     * Finds a user by ID
     * @param {string} id 
     */
    async findById(id) {
        const doc = await db.collection(COLLECTION).doc(id).get();
        if (!doc.exists) return null;
        return { _id: doc.id, ...doc.data() };
    },

    /**
     * Creates a new user
     * @param {object} userData 
     */
    async create(userData) {
        const userToCreate = {
            ...userData,
            email: userData.email.toLowerCase(),
            savedJobs: userData.savedJobs || [],
            skills: userData.skills || [],
            education: userData.education || [],
            recentResumeId: userData.recentResumeId || null,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const docRef = await db.collection(COLLECTION).add(userToCreate);
        return { _id: docRef.id, ...userToCreate };
    },

    /**
     * Updates a user by ID
     * @param {string} id 
     * @param {object} updateData 
     */
    async findByIdAndUpdate(id, updateData) {
        const docRef = db.collection(COLLECTION).doc(id);
        const dataToUpdate = {
            ...updateData,
            updatedAt: new Date()
        };
        await docRef.update(dataToUpdate);
        const updatedDoc = await docRef.get();
        return { _id: updatedDoc.id, ...updatedDoc.data() };
    }
};

module.exports = User;
