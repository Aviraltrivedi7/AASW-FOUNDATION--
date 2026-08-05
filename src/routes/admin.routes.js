const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const path = require('path');
const { isAuthenticated } = require('../middlewares/auth.middleware');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const db = require('../services/db.service');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('❌ FATAL: JWT_SECRET environment variable is not set. Admin auth will not work.');
}

// Serve login page
router.get('/login', (req, res) => {
    if (req.cookies && req.cookies.admin_token) {
        try {
            jwt.verify(req.cookies.admin_token, JWT_SECRET);
            return res.redirect('/admin/dashboard');
        } catch (e) {
            // Invalid token, fall through to login
        }
    }
    // We will update res.sendFile to res.render in Phase 5 EJS conversion
    // But for now if it's not converted yet we point to static OR let EJS catch it later
    // Since Phase 5 hasn't executed, we will fall back to static
    const viewPath = path.join(process.cwd(), 'views', 'admin-login.ejs');
    if (require('fs').existsSync(viewPath)) {
        res.render('admin-login');
    } else {
        res.sendFile(path.join(process.cwd(), 'aasw-pro', 'admin', 'login.html'));
    }
});

// Process login
router.post('/login', async (req, res, next) => {
    try {
        let { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json(new ApiError(400, "Email and password are required"));
        }

        email = email.trim().toLowerCase();

        const { getInsforge } = require('../config/insforge');
        const insforge = await getInsforge();
        
        if (!insforge) {
            return res.status(500).json(new ApiError(500, "Authentication service unavailable"));
        }

        const { data, error } = await insforge.auth.signInWithPassword({
            email,
            password
        });

        if (error || !data.accessToken) {
            // Also try fallback to mongo if we want, but rules say use SDK for auth
            return res.status(401).json(new ApiError(401, error ? error.message : "Invalid email or password"));
        }

        // Setup session via local JWT Cookie (authenticated via SDK)
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { id: data.user.id, email: data.user.email, role: 'admin' }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );
        
        res.cookie('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        return res.status(200).json(new ApiResponse(200, { redirect: '/admin/dashboard' }, "Login successful"));
    } catch (err) {
        next(err);
    }
});

// Logout
router.get('/logout', async (req, res) => {
    try {
        const { getInsforge } = require('../config/insforge');
        const insforge = await getInsforge();
        if (insforge) {
            await insforge.auth.signOut();
        }
    } catch (err) {
        console.error('[Auth] Failed to sign out from InsForge:', err);
    }
    res.clearCookie('admin_token');
    res.redirect('/admin/login');
});

// Secured Dashboard Route
router.get('/dashboard', isAuthenticated, (req, res) => {
    const viewPath = path.join(process.cwd(), 'views', 'dashboard.ejs');
    if (require('fs').existsSync(viewPath)) {
        res.render('dashboard');
    } else {
        res.sendFile(path.join(process.cwd(), 'aasw-pro', 'admin', 'dashboard.html'));
    }
});

// Protected Stats API — uses hybrid DB service
router.get('/api/stats', isAuthenticated, async (req, res, next) => {
    try {
        const payload = await db.getAdminStats();
        res.status(200).json(new ApiResponse(200, payload, "Admin stats retrieved"));
    } catch (error) {
        console.error(error);
        next(new ApiError(500, "Error retrieving admin dashboard stats"));
    }
});

module.exports = router;
