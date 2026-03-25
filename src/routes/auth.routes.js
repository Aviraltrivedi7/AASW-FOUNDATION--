const express = require('express');
const router = express.Router();
const { signup, verifyOtp, login, getCurrentUser, logout } = require('../controllers/auth.controller');

router.post('/signup', signup);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.get('/me', getCurrentUser);
router.post('/logout', logout);

module.exports = router;
