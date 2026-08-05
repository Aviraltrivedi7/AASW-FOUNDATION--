const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const compression = require("compression");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const { errorHandler } = require("./middlewares/error.middleware");
const { getTranslator } = require("./utils/lang");

// Route imports
const healthRoutes = require("./routes/health.routes");
const contactRoutes = require("./routes/contact.routes");
const subscriberRoutes = require("./routes/subscriber.routes");
const adminRoutes = require("./routes/admin.routes");
const membershipRoutes = require("./routes/membership.routes");
const donationRoutes = require("./routes/donation.routes");
const { ApiError } = require("./utils/apiError");
const { visitorTracker, isAuthenticated } = require('./middlewares/auth.middleware');

const app = express();

// Vercel Edge handles HTTPS redirection automatically for all production domains



// Set View Engine
// Set View Engine
// EJS has been removed as the frontend is now served statically via the aasw-pro folder

// GLOBAL MIDDLEWARES
// Gzip compression — reduces response sizes by ~70%, fixes lag/slow loading
app.use(compression({
    level: 6,
    threshold: 1024, // Only compress responses > 1KB
    filter: (req, res) => {
        if (req.headers['x-no-compression']) return false;
        return compression.filter(req, res);
    }
}));

app.use(helmet({
    contentSecurityPolicy: false,
    hidePoweredBy: false
}));

// Universal CORS Middleware — Allows all origins seamlessly without package dependencies
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400');
    
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    next();
});

app.use(express.json({ 
    limit: "10mb",
    verify: (req, res, buf) => {
        req.rawBody = buf; // Save raw body for Razorpay webhook signature verification
    }
}));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(visitorTracker);

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
} else {
    app.use((req, res, next) => {
        if (!req.socket) return next();
        return morgan("tiny")(req, res, next);
    });
}

const { connectMongoDB, isMongoConnected } = require("./config/mongodb");

let dbConnectionPromise = null;
const ensureDbConnected = async (req, res, next) => {
    if (isMongoConnected()) {
        return next();
    }
    
    if (!dbConnectionPromise) {
        dbConnectionPromise = connectMongoDB().catch(err => {
            console.error('[Middleware] Database connection failed:', err.message);
            dbConnectionPromise = null;
            return false;
        });
    }
    
    // Wait for the connection to complete before proceeding on cold starts
    await dbConnectionPromise;
    next();
};


function getClientIp(req) {
    if (req.headers && req.headers['x-forwarded-for']) {
        return req.headers['x-forwarded-for'].split(',')[0].trim();
    }
    if (req.socket && req.socket.remoteAddress) {
        return req.socket.remoteAddress;
    }
    return '127.0.0.1';
}

const apiLimiter = rateLimit({ 
    windowMs: 15 * 60 * 1000, 
    max: 200, 
    standardHeaders: true, 
    legacyHeaders: false, 
    keyGenerator: getClientIp,
    message: { statusCode: 429, message: 'Too many requests. Please wait a few minutes and try again.' },
    // Skip rate limiting for Razorpay webhooks — they come from Razorpay's servers
    skip: (req) => req.originalUrl && req.originalUrl.includes('/membership/webhook')
});
const formLimiter = rateLimit({ 
    windowMs: 10 * 60 * 1000, 
    max: 15, 
    standardHeaders: true, 
    legacyHeaders: false,
    keyGenerator: getClientIp
});

app.use("/api/", ensureDbConnected);
app.use("/api/", apiLimiter);

app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/contact", formLimiter, contactRoutes);
app.use("/api/v1/subscribe", formLimiter, subscriberRoutes);
app.use("/api/v1/membership", membershipRoutes);
app.use("/api/v1/donation", donationRoutes);
app.use("/admin", adminRoutes);

// Static frontend serving — serve the premium Obsidian Lens HTML pages
const staticPath = path.join(process.cwd(), "aasw-pro");
app.use(express.static(staticPath, {
    maxAge: '1y',          // Cache static assets for 1 year
    etag: true,            // Enable ETag for cache validation
    lastModified: true,    // Enable Last-Modified headers
    immutable: true,       // Tell browsers cached assets won't change
    setHeaders: (res, filePath) => {
        // HTML files should not be cached aggressively (they change)
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, must-revalidate');
        }
        // Disable aggressive caching for light-mode.css so styling fixes are fetched instantly
        else if (filePath.endsWith('light-mode.css')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
        // Images, CSS, JS, fonts — aggressive caching
        else if (/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot)$/.test(filePath)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
    }
}));

// Favicon handler — prevent 404 errors from browsers requesting /favicon.ico
app.get('/favicon.ico', (req, res) => {
    const faviconPath = path.join(staticPath, 'favicon.svg');
    if (fs.existsSync(faviconPath)) {
        return res.type('image/svg+xml').sendFile(faviconPath);
    }
    const pngFavicon = path.join(staticPath, 'images', 'favicon.png');
    if (fs.existsSync(pngFavicon)) {
        return res.type('image/png').sendFile(pngFavicon);
    }
    res.status(204).end();
});

// Serve homepage at root
app.get('/', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
});

// Clean URL rewrite — serve /team → /team.html, /membership → /membership.html, etc.
// This makes footer/internal links without .html extension work correctly
app.use((req, res, next) => {
    // Skip API routes, admin routes, static files with extensions, and POST/PUT requests
    if (req.method !== 'GET' || req.originalUrl.startsWith('/api/') || req.originalUrl.startsWith('/admin')) {
        return next();
    }
    // Skip if URL already has a file extension
    if (path.extname(req.path)) {
        return next();
    }
    // Try to find a matching .html file
    const htmlFile = path.join(staticPath, req.path + '.html');
    if (fs.existsSync(htmlFile)) {
        return res.sendFile(htmlFile);
    }
    next();
});

// Catch-all: serve static HTML or 404
app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api/') || req.originalUrl.startsWith('/admin')) {
        return next(new ApiError(404, "API endpoint not found"));
    }
    // Serve styled 404 page for browser requests
    res.status(404).sendFile(path.join(staticPath, '404.html'));
});

// GLOBAL ERROR HANDLER
app.use(errorHandler);

module.exports = app;
