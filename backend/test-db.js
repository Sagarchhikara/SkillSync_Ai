require('dotenv').config();
const { db } = require('./src/config/firebase');
console.log("DB IN SCRIPT:", !!db);
