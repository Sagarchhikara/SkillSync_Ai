const { db } = require('./firebase');

/**
 * Clears specific Firestore collections used during testing.
 * IMPORTANT: Specify only test collections here to avoid accidental data loss.
 * If tests are run on a shared project, ensure test data is segmented (e.g., using a 'test_' prefix).
 */
async function clearFirestoreDb() {
    const collectionsToClear = ['users', 'resumes', 'jobs']; // Add test collection prefixes if needed later

    for (const collectionName of collectionsToClear) {
        let batch = db.batch();
        let querySnapshot = await db.collection(collectionName).limit(500).get();
        let deletedCount = 0;

        while (!querySnapshot.empty) {
            querySnapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            deletedCount += querySnapshot.size;

            // Prepare next batch
            batch = db.batch();
            querySnapshot = await db.collection(collectionName).limit(500).get();
        }
        
        // Uncomment minimal logging for test debugging if needed
        // console.log(`Deleted ${deletedCount} documents from ${collectionName}`);
    }
}

module.exports = { clearFirestoreDb };
