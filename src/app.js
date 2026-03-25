const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { errorHandler } = require("./middlewares/error.middleware");

// Route imports
const healthRoutes = require("./routes/health.routes");
const contactRoutes = require("./routes/contact.routes");
const newsletterRoutes = require("./routes/newsletter.routes");
const adminRoutes = require("./routes/admin.routes");
const authRoutes = require("./routes/auth.routes");
const membershipRoutes = require("./routes/membership.routes");
const { ApiError } = require("./utils/apiError");
const session = require("express-session");
const { visitorTracker } = require("./middlewares/auth.middleware");

const app = express();

// GLOBAL MIDDLEWARES

// Security headers
app.use(helmet({
    contentSecurityPolicy: false
}));

// CORS — restrict to allowed origins (set ALLOWED_ORIGINS in .env for production)
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, Postman in dev)
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error(`CORS policy: origin '${origin}' not allowed`));
    },
    credentials: true
}));

// Body parsing
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Express Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'aasw_super_secret_key_123',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 86400000 } // 1 day
}));

// Visitor Tracking (Applied before static routes to catch HTML requests)
app.use(visitorTracker);

// Protect the original dashboard HTML file directly
const { isAuthenticated } = require("./middlewares/auth.middleware");
app.get('/dashboard.html', isAuthenticated, (req, res, next) => next());

// HTTP request logging
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
} else {
    // In production, keep Morgan but log less verbosely as to not crowd logs.
    app.use(morgan("tiny"));
}

// Rate Limiting — general API protection
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests from this IP, please try again after 15 minutes" }
});

// Strict rate limit for form submissions (contact + newsletter)
const formLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5, // max 5 form submissions per 10 minutes per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many submissions. Please wait 10 minutes before trying again." }
});

// Auth rate limit — more generous to allow signup + OTP + login flow
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // signup + verify-otp + login attempts
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many auth requests. Please wait 15 minutes before trying again." }
});

// Apply rate limiting to all API routes
app.use("/api/", apiLimiter);

// 2. API ROUTES
// Routes usage
app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/contact", formLimiter, contactRoutes);
app.use("/api/v1/newsletter", formLimiter, newsletterRoutes);
app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/membership", membershipRoutes);
app.use("/admin", adminRoutes);

// 3. STATIC FRONTEND SERVING
// Serve static frontend files from 'aasw-pro' directory
const frontendPath = path.join(__dirname, "..", "aasw-pro");
app.use(express.static(frontendPath));

// Catch-all route: try to serve matching .html file, else fallback to index.html
app.use((req, res, next) => {
    // If it's an API route that wasn't found, send JSON 404 instead of HTML
    if (req.originalUrl.startsWith("/api/")) {
        return next(new ApiError(404, "API route not found"));
    }
    // Try to serve the requested .html file (e.g. /dashboard → dashboard.html)
    if (!req.path.endsWith('.html') && req.path !== '/') {
        const htmlFile = path.join(frontendPath, req.path + '.html');
        if (fs.existsSync(htmlFile)) {
            return res.sendFile(htmlFile);
        }
    }
    res.sendFile(path.join(frontendPath, "index.html"));
});

// 4. GLOBAL ERROR HANDLER
app.use(errorHandler);

module.exports = app;
