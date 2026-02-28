const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const connectDB = require('./src/config/db');
const app = require('./src/app');

// 1. Establish Database Connection
connectDB();

// 2. Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
