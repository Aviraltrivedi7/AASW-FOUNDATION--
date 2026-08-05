const path = require('path');
const { ApiError } = require('../utils/apiError');
const db = require('../services/db.service');

// In-memory stats buffer + debounced write
let statsBuffer = { visitors: 0, pageViews: {} };
let statsWriteTimer = null;
let initialized = false;

async function fetchInitialStats() {
    if (initialized) return;
    try {
        const data = await db.getSiteStats();
        if (data && data.length > 0) {
            const vis = data.find(r => r.key === 'visitors');
            if (vis) statsBuffer.visitors = vis.value;
            // Load page views from DB into memory
            data.filter(r => r.key.startsWith('pv_')).forEach(r => {
                statsBuffer.pageViews[r.key.replace('pv_', '')] = r.value;
            });
        }
        initialized = true;
    } catch (e) { console.error('Stats init err', e); }
}

async function flushStats() {
    if (!initialized) return;
    try {
        const statsArray = [{ key: 'visitors', value: statsBuffer.visitors }];
        
        // Add page views
        Object.keys(statsBuffer.pageViews).forEach(page => {
            statsArray.push({ key: 'pv_' + page, value: statsBuffer.pageViews[page] });
        });

        await db.upsertSiteStats(statsArray);
    } catch (err) {
        console.error('[Stats] Error writing stats to DB:', err.message);
    }
}

// Middleware to check if admin is logged in
const isAuthenticated = (req, res, next) => {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
        return next(new ApiError(500, 'Server misconfiguration: JWT_SECRET not set'));
    }

    // Phase 3 Check (JWT Cookie) — verify actual signature
    if (req.cookies && req.cookies.admin_token) {
        try {
            const decoded = jwt.verify(req.cookies.admin_token, JWT_SECRET);
            req.admin = decoded; // attach admin info for downstream use
            return next();
        } catch (e) {
            // Invalid/expired token — clear cookie and fall through
            res.clearCookie('admin_token');
        }
    }
    
    // Legacy Check
    if (req.session && req.session.adminId) {
        return next();
    }
    
    // If it's an API request, send JSON error
    if (req.originalUrl.startsWith('/admin/api')) {
        return next(new ApiError(401, 'Not authorized to access this route'));
    }
    
    // For HTML pages, redirect to login
    res.redirect('/admin/login');
};

// Middleware to track unique visitors per page
const visitorTracker = async (req, res, next) => {
    // Ignore static assets and API routes
    const ext = req.path.match(/\.\w+$/);
    if (ext && ext[0] !== '.html' && ext[0] !== '.ejs') return next();
    if (req.originalUrl.startsWith('/api/') || req.originalUrl.startsWith('/admin/api/') || req.originalUrl === '/admin/login') {
        return next();
    }

    if (!initialized) await fetchInitialStats();

    try {
        statsBuffer.visitors += 1;
        const page = req.path === '/' ? '/index' : req.path;
        statsBuffer.pageViews[page] = (statsBuffer.pageViews[page] || 0) + 1;

        clearTimeout(statsWriteTimer);
        statsWriteTimer = setTimeout(flushStats, 5000); // 5 sec debounce
    } catch (err) {
        console.error('[Stats] Error tracking visitor:', err.message);
    }
    
    next();
};

module.exports = { isAuthenticated, visitorTracker };
