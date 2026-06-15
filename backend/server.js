const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const app = require('./src/app');
const { preloadModel } = require('./src/services/matchService');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    // 1. Preload and warm up NLP embedding model
    await preloadModel();

    // 2. Start Express app listener
    app.listen(PORT, () => {
        console.log(`[SERVER] Running on port ${PORT}`);
    });
};

startServer().catch(err => {
    console.error('[SERVER] Fatal startup error:', err);
    process.exit(1);
});
