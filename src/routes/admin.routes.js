const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { isAuthenticated } = require('../middlewares/auth.middleware');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');

// Serve login page
router.get('/login', (req, res) => {
    if (req.session && req.session.adminId) {
        return res.redirect('/admin/dashboard');
    }
    res.sendFile(path.join(process.cwd(), 'aasw-pro', 'admin', 'login.html'));
});

// Process login
router.post('/login', (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json(new ApiError(400, "Email and password are required"));
        }

        const credsPath = path.join(process.cwd(), 'data', 'credentials.json');
        if (!fs.existsSync(credsPath)) {
            return res.status(500).json(new ApiError(500, "Admin credentials not configured"));
        }

        const credentials = JSON.parse(fs.readFileSync(credsPath, 'utf8'));

        if (email !== credentials.email || !bcrypt.compareSync(password, credentials.passwordHash)) {
            return res.status(401).json(new ApiError(401, "Invalid email or password"));
        }

        // Setup session
        req.session.adminId = "admin-authenticated";
        return res.status(200).json(new ApiResponse(200, { redirect: '/dashboard.html' }, "Login successful"));
    } catch (err) {
        next(err);
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

// Secured Dashboard Route (Redirect to static file server which is protected in app.js)
router.get('/dashboard', isAuthenticated, (req, res) => {
    res.redirect('/dashboard.html');
});

// Protected Stats API
router.get('/api/stats', isAuthenticated, (req, res, next) => {
    try {
        const dataPath = path.join(process.cwd(), 'data');
        
        // Fetch visitors
        let stats = { visitors: 0, pageViews: {} };
        const statsPath = path.join(dataPath, 'stats.json');
        if (fs.existsSync(statsPath)) stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));

        // Fetch contacts
        let contacts = [];
        const contactsPath = path.join(process.cwd(), 'contacts.json');
        if (fs.existsSync(contactsPath)) contacts = JSON.parse(fs.readFileSync(contactsPath, 'utf8')).contacts || [];

        // Fetch subscribers
        let subscribers = [];
        const subsPath = path.join(process.cwd(), 'subscribers.json');
        if (fs.existsSync(subsPath)) subscribers = JSON.parse(fs.readFileSync(subsPath, 'utf8')).subscribers || [];

        // Fetch memberships
        let memberships = [];
        const memPath = path.join(dataPath, 'memberships.json');
        if (fs.existsSync(memPath)) memberships = JSON.parse(fs.readFileSync(memPath, 'utf8')).memberships || [];

        const payload = {
            overview: {
                totalVisitors: stats.visitors,
                totalContacts: contacts.length,
                totalSubscribers: subscribers.length,
                totalMemberships: memberships.length
            },
            pageViews: stats.pageViews,
            recentContacts: contacts.slice(-5).reverse(), // Last 5
            recentSubscribers: subscribers.slice(-5).reverse(), // Last 5
            recentMemberships: memberships.slice(-5).reverse(), // Last 5
            allContacts: contacts.slice().reverse(),
            allSubscribers: subscribers.slice().reverse(),
            allMemberships: memberships.slice().reverse()
        };

        res.status(200).json(new ApiResponse(200, payload, "Admin stats retrieved"));
    } catch (error) {
        next(new ApiError(500, "Error retrieving admin dashboard stats"));
    }
});

module.exports = router;
