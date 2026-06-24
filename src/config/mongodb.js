const mongoose = require('mongoose');

let isConnected = false;

/**
 * Connect to MongoDB with retry logic and event handlers.
 * Reads MONGODB_URI from environment. Fails gracefully if not configured.
 */
async function connectMongoDB() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        console.warn('[MongoDB] ⚠️  MONGODB_URI not set — MongoDB features disabled. Using InsForge as fallback.');
        return false;
    }

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 3000,
            socketTimeoutMS: 10000,
            maxPoolSize: 5,
            connectTimeoutMS: 3000,
        });

        isConnected = true;
        console.log('[MongoDB] ✓ Connected successfully');

        mongoose.connection.on('error', (err) => {
            console.error('[MongoDB] Connection error:', err.message);
            isConnected = false;
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('[MongoDB] Disconnected. Will auto-reconnect...');
            isConnected = false;
        });

        mongoose.connection.on('reconnected', () => {
            console.log('[MongoDB] ✓ Reconnected');
            isConnected = true;
        });

        return true;
    } catch (err) {
        console.error('[MongoDB] ❌ Initial connection failed:', err.message);
        console.warn('[MongoDB] Falling back to InsForge as primary database.');
        isConnected = false;
        return false;
    }
}

/**
 * Check if MongoDB is currently connected and ready.
 */
function isMongoConnected() {
    return isConnected && mongoose.connection.readyState === 1;
}

module.exports = { connectMongoDB, isMongoConnected };
