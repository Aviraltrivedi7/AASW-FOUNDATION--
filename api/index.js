// Load .env for local dev; on Vercel, env vars come from the dashboard
try { require('dotenv').config(); } catch (_) { /* dotenv may not be installed in prod */ }

const app = require('../src/app');
const { connectMongoDB } = require('../src/config/mongodb');

// Connect to MongoDB when the serverless function starts
connectMongoDB().catch(console.error);

// Provide the Vercel serverless function export
module.exports = app;

