const app = require('../src/app');
const { connectMongoDB } = require('../src/config/mongodb');

// Connect to MongoDB when the serverless function starts
connectMongoDB().catch(console.error);

// Provide the Vercel serverless function export
module.exports = app;
