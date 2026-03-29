const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { catchAsync } = require('../utils/catchAsync');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const { sendOTP } = require('../utils/email');

const USERS_FILE = path.join(__dirname, '..', '..', 'data', 'users.json');

// Ensure users.json exists
const initDb = () => {
    if (!fs.existsSync(USERS_FILE)) {
        if (!fs.existsSync(path.dirname(USERS_FILE))) {
            fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
        }
        fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2), 'utf-8');
    }
};

const readUsers = () => {
    initDb();
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.error('[Auth] Error reading users file:', err.message);
        return { users: [] };
    }
};

const writeUsers = (data) => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
};

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
};

// SIGN UP API
const signup = catchAsync(async (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return next(new ApiError(400, "Name, email, and password are required"));
    }

    const data = readUsers();
    const existingUser = data.users.find(u => u.email === email.toLowerCase());

    if (existingUser) {
        if (existingUser.isVerified) {
            return next(new ApiError(409, "User already exists with this email"));
        } else {
            // Re-send OTP if they are unverified
            const otp = generateOTP();
            existingUser.otp = otp;
            existingUser.otpExpiry = Date.now() + 3 * 60 * 1000; // 3 minutes
            // Update password hash just in case they typed a different one
            existingUser.passwordHash = await bcrypt.hash(password, 8);
            
            writeUsers(data);
            // Fire-and-forget — don't make user wait for email delivery
            sendOTP(existingUser.email, otp).catch(err => console.error('[Auth] OTP send failed:', err.message));
            
            return res.status(200).json(new ApiResponse(200, { email: existingUser.email }, "OTP re-sent to email"));
        }
    }

    const passwordHash = await bcrypt.hash(password, 8);
    const otp = generateOTP();

    const newUser = {
        id: Date.now().toString(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        isVerified: false,
        otp,
        otpExpiry: Date.now() + 3 * 60 * 1000, // 3 min
        createdAt: new Date().toISOString()
    };

    data.users.push(newUser);
    writeUsers(data);

    // Send email
    // Fire-and-forget — don't make user wait for email delivery
    sendOTP(newUser.email, otp).catch(err => console.error('[Auth] OTP send failed:', err.message));

    return res.status(201).json(new ApiResponse(201, { email: newUser.email }, "Signup successful check email for OTP"));
});

// VERIFY OTP API
const verifyOtp = catchAsync(async (req, res, next) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return next(new ApiError(400, "Email and OTP are required"));
    }

    const data = readUsers();
    const userIndex = data.users.findIndex(u => u.email === email.toLowerCase());

    if (userIndex === -1) {
        return next(new ApiError(404, "User not found"));
    }

    const user = data.users[userIndex];

    if (user.isVerified) {
        return next(new ApiError(400, "User is already verified"));
    }

    if (user.otp !== otp) {
        return next(new ApiError(401, "Invalid OTP"));
    }

    if (Date.now() > user.otpExpiry) {
        return next(new ApiError(401, "OTP has expired. Please sign up again to generate a new block"));
    }

    // Verify User
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    writeUsers(data);

    return res.status(200).json(new ApiResponse(200, {}, "Email successfully verified. You can now login."));
});

// LOGIN API
const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ApiError(400, "Email and password are required"));
    }

    const data = readUsers();
    const user = data.users.find(u => u.email === email.toLowerCase());

    if (!user) {
        return next(new ApiError(401, "Invalid email or password"));
    }

    if (!user.isVerified) {
        return next(new ApiError(403, "Please verify your email address via OTP first"));
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
        return next(new ApiError(401, "Invalid email or password"));
    }

    // Setup session
    req.session.userId = user.id;
    req.session.userName = user.name;
    req.session.userEmail = user.email;

    return res.status(200).json(new ApiResponse(200, { redirect: '/' }, "Login successful"));
});

// GET CURRENT USER API
const getCurrentUser = catchAsync(async (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json(new ApiResponse(401, null, "Not authenticated"));
    }
    
    return res.status(200).json(new ApiResponse(200, { 
        id: req.session.userId, 
        name: req.session.userName, 
        email: req.session.userEmail 
    }, "User fetched successfully"));
});

// LOGOUT API
const logout = catchAsync(async (req, res, next) => {
    req.session.destroy();
    res.status(200).json(new ApiResponse(200, { redirect: '/login.html' }, "Logged out successfully"));
});

module.exports = {
    signup,
    verifyOtp,
    login,
    getCurrentUser,
    logout
};
