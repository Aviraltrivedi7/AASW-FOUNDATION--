require("dotenv").config();
const app = require("./src/app");
const cluster = require("cluster");
const os = require("os");

const PORT = process.env.PORT || 3000;

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
    // Workers share the same TCP connection in load balancer pattern
    const server = app.listen(PORT, () => {
        console.log(`⚡ Worker ${process.pid} is active and ready on port ${PORT}`);
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
