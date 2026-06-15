const { db } = require('../config/firebase');
const bcrypt = require('bcryptjs');

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
     * Creates a new user with automatic password hashing
     * @param {object} userData 
     */
    async create(userData) {
        let password = userData.password;
        if (password && !(password.startsWith('$2a$') || password.startsWith('$2b$'))) {
            const salt = await bcrypt.genSalt(10);
            password = await bcrypt.hash(password, salt);
        }

        const userToCreate = {
            ...userData,
            email: userData.email.toLowerCase(),
            password: password,
            role: userData.role || 'applicant',
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
     * Updates a user by ID with automatic password hashing if updated
     * @param {string} id 
     * @param {object} updateData 
     */
    async findByIdAndUpdate(id, updateData) {
        const docRef = db.collection(COLLECTION).doc(id);
        const dataToUpdate = {
            ...updateData,
            updatedAt: new Date()
        };

        if (updateData.password && !(updateData.password.startsWith('$2a$') || updateData.password.startsWith('$2b$'))) {
            const salt = await bcrypt.genSalt(10);
            dataToUpdate.password = await bcrypt.hash(updateData.password, salt);
        }

        await docRef.update(dataToUpdate);
        const updatedDoc = await docRef.get();
        return { _id: updatedDoc.id, ...updatedDoc.data() };
    }
};

module.exports = User;
