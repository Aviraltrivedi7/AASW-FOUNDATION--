require("dotenv").config();
const cluster = require("cluster");
const os = require("os");

const PORT = process.env.PORT || 3000;

// ─── SECURITY: Warn about missing critical env vars ──────────────────────
if (cluster.isMaster || !cluster.isMaster) {
    const missing = [];
    if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');
    if (!process.env.RAZORPAY_KEY_ID) missing.push('RAZORPAY_KEY_ID');
    if (!process.env.RAZORPAY_KEY_SECRET) missing.push('RAZORPAY_KEY_SECRET');
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) missing.push('RAZORPAY_WEBHOOK_SECRET');
    if (missing.length > 0 && cluster.isMaster) {
        console.warn(`\n⚠️  SECURITY WARNING: The following env vars are NOT set and will use INSECURE hardcoded fallbacks:`);
        missing.forEach(v => console.warn(`   ❌ ${v}`));
        console.warn(`   Set these in your .env file before deploying to production!\n`);
    }

    if (process.env.RAZORPAY_WEBHOOK_SECRET && 
        (process.env.RAZORPAY_WEBHOOK_SECRET.includes('dummy') || process.env.RAZORPAY_WEBHOOK_SECRET.includes('replace')) && 
        cluster.isMaster) {
        console.warn(`\n⚠️  SECURITY WARNING: Dummy Razorpay webhook secret is active! Replace in production.`);
        console.warn(`   Current value: ${process.env.RAZORPAY_WEBHOOK_SECRET}\n`);
    }
}

// High-Traffic & Crash-Proof Implementation 
if (cluster.isMaster) {
    const numCPUs = os.cpus().length;
    console.log(`\n================================`);
    console.log(`🛡️ Master process ${process.pid} is running`);
    console.log(`🚀 Spawning ${numCPUs} Web Workers to handle High Traffic...`);
    
    // Fork workers for each CPU core
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    // Auto-Restart Worker if it crashes due to traffic/memory leak
    cluster.on("exit", (worker, code, signal) => {
        console.error(`❌ Worker ${worker.process.pid} died (Code: ${code}). Restarting immediately to keep website alive...`);
        cluster.fork();
    });

} else {
    // Each worker connects to MongoDB independently
    const { connectMongoDB } = require('./src/config/mongodb');
    
    connectMongoDB().then((connected) => {
        if (connected) {
            console.log(`[Worker ${process.pid}] MongoDB connected ✓`);
        } else {
            console.warn(`[Worker ${process.pid}] MongoDB unavailable — using InsForge as primary`);
        }
        
        // Start Express AFTER MongoDB connection attempt (regardless of success)
        const app = require("./src/app");
        const server = app.listen(PORT, () => {
            console.log(`⚡ Worker ${process.pid} is active and ready on port ${PORT}`);
        });
    }).catch(err => {
        console.error(`[Worker ${process.pid}] MongoDB connection error:`, err.message);
        
        // Start Express anyway — InsForge will serve as fallback
        const app = require("./src/app");
        const server = app.listen(PORT, () => {
            console.log(`⚡ Worker ${process.pid} is active (InsForge-only mode) on port ${PORT}`);
        });
    });

    // Graceful error handling so traffic spikes don't bring down the worker
    process.on("uncaughtException", (err) => {
        console.error(`[CRITICAL] Uncaught Exception in worker ${process.pid}:`, err);
        // Let the master realize this worker is corrupted and spawn a fresh one safely
        process.exit(1); 
    });

    process.on("unhandledRejection", (err) => {
        console.error(`[CRITICAL] Unhandled Rejection in worker ${process.pid}:`, err);
    });
}
