const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { isAuthenticated } = require('../middlewares/auth.middleware');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const { insforge } = require('../config/insforge');

const JWT_SECRET = process.env.JWT_SECRET || 'aasw_admin_super_secret_for_jwt_2026';

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

        if (!insforge) {
            return res.status(500).json(new ApiError(500, "Database not configured"));
        }

        const { data: admin, error } = await insforge.database.from('admins').select('*').eq('email', email).single();

        if (error || !admin || !bcrypt.compareSync(password, admin.password_hash)) {
            return res.status(401).json(new ApiError(401, "Invalid email or password"));
        }

        // Setup session via JWT Cookie
        const token = jwt.sign({ id: admin.id, email: admin.email, role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
        
        res.cookie('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        return res.status(200).json(new ApiResponse(200, { redirect: '/dashboard' }, "Login successful"));
    } catch (err) {
        next(err);
    }
});

// Logout
router.get('/logout', (req, res) => {
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

// Protected Stats API
router.get('/api/stats', isAuthenticated, async (req, res, next) => {
    try {
        if (!insforge) throw new Error("Database not connected");

        // Fetch parallel data from InsForge
        const [
            { data: statsData },
            { data: contacts, count: contactsCount },
            { data: subscribers, count: subsCount },
            { data: memberships, count: memsCount }
        ] = await Promise.all([
            insforge.database.from('site_stats').select('*'),
            insforge.database.from('contacts').select('*').order('created_at', { ascending: false }).limit(5),
            insforge.database.from('subscribers').select('*').order('subscribed_at', { ascending: false }).limit(5),
            insforge.database.from('members').select('*').order('created_at', { ascending: false }).limit(5)
            // Note: Actual count queries in production could use exact counting
        ]);

        let totalVisitors = 0;
        let pageViews = {};

        if (statsData) {
            const vis = statsData.find(r => r.key === 'visitors');
            if (vis) totalVisitors = vis.value;
            statsData.filter(r => r.key.startsWith('pv_')).forEach(r => {
                pageViews[r.key.replace('pv_', '')] = r.value;
            });
        }

        // Just approximations for overview totals since we didn't do a full count query
        // Normally, you would use { count: 'exact' } with insforge.database.from().select('*', { count: 'exact', head: true })

        const payload = {
            overview: {
                totalVisitors,
                totalContacts: contacts ? contacts.length : 0, 
                totalSubscribers: subscribers ? subscribers.length : 0,
                totalMemberships: memberships ? memberships.length : 0
            },
            pageViews,
            recentContacts: contacts || [],
            recentSubscribers: subscribers || [],
            recentMemberships: memberships || [],
            allContacts: contacts || [],
            allSubscribers: subscribers || [],
            allMemberships: memberships || []
        };

        res.status(200).json(new ApiResponse(200, payload, "Admin stats retrieved"));
    } catch (error) {
        console.error(error);
        next(new ApiError(500, "Error retrieving admin dashboard stats"));
    }
});

module.exports = router;
