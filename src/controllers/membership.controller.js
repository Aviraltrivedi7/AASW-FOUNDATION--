const { catchAsync } = require('../utils/catchAsync');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const { sendOTP } = require('../utils/email');
const fs = require('fs');
const path = require('path');

// Membership plans definition
const MEMBERSHIP_PLANS = [
    {
        id: 'saathi',
        name: 'Saathi',
        nameHi: 'साथी',
        price: 500,
        duration: 'year',
        tagline: 'Perfect for supporters',
        badge: '🌱',
        color: '#059669',
        features: [
            'Digital membership certificate',
            'Monthly newsletter',
            'Impact updates & reports',
            'Member-only community access'
        ]
    },
    {
        id: 'sevak',
        name: 'Sevak',
        nameHi: 'सेवक',
        price: 1500,
        duration: 'year',
        tagline: 'Most Popular',
        badge: '🌟',
        color: '#1a73e8',
        popular: true,
        features: [
            'All Saathi benefits',
            'Name featured on website',
            'Exclusive event invitations',
            'Volunteer opportunities',
            'Annual impact report (physical copy)'
        ]
    },
    {
        id: 'patron',
        name: 'Patron',
        nameHi: 'संरक्षक',
        price: 5000,
        duration: 'year',
        tagline: 'For dedicated leaders',
        badge: '🏆',
        color: '#d97706',
        features: [
            'All Sevak benefits',
            'Recognition plaque',
            'Board meeting observer status',
            'Special recognition at events',
            'Direct impact updates from field teams',
            'Dedicated relationship manager'
        ]
    }
];

// Generate 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Validate email
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// POST /api/v1/membership/send-otp
const requestEmailOTP = catchAsync(async (req, res) => {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
        throw new ApiError(400, 'Please enter a valid email address.');
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP in session
    req.session.membershipOTP = {
        email,
        otp,
        expiresAt,
        verified: false
    };

    const sent = await sendOTP(email, otp);

    if (!sent) {
        throw new ApiError(500, 'Failed to send OTP email. Please try again.');
    }

    const devMode = (!process.env.SMTP_USER || !process.env.SMTP_PASS);
    const responseMsg = devMode
        ? `[DEV MODE] OTP sent to console. Check your server logs.`
        : `OTP sent to ${email}. Valid for 5 minutes.`;

    return res.status(200).json(
        new ApiResponse(200, { email, devMode }, responseMsg)
    );
});

// POST /api/v1/membership/verify-otp
const verifyEmailOTP = catchAsync(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError(400, 'Email address and OTP are required.');
    }

    const sessionOTP = req.session.membershipOTP;

    if (!sessionOTP) {
        throw new ApiError(400, 'No OTP found. Please request a new OTP.');
    }

    if (sessionOTP.email !== email) {
        throw new ApiError(400, 'Email does not match. Please request a new OTP.');
    }

    if (Date.now() > sessionOTP.expiresAt) {
        delete req.session.membershipOTP;
        throw new ApiError(400, 'OTP has expired. Please request a new OTP.');
    }

    if (sessionOTP.otp !== otp.toString()) {
        throw new ApiError(400, 'Invalid OTP. Please check and try again.');
    }

    // Mark as verified
    req.session.membershipOTP.verified = true;
    req.session.verifiedEmail = email;

    return res.status(200).json(
        new ApiResponse(200, { email, verified: true }, 'Email address verified successfully!')
    );
});

// GET /api/v1/membership/plans
const getMembershipPlans = catchAsync(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, { plans: MEMBERSHIP_PLANS }, 'Membership plans fetched successfully.')
    );
});

// POST /api/v1/membership/submit-payment
const submitPayment = catchAsync(async (req, res) => {
    const { email, planId, planName, amount, txnId } = req.body;

    if (!email || !planId || !amount || !txnId) {
        throw new ApiError(400, 'All payment details are required including Transaction ID.');
    }

    // Verify session
    if (!req.session.membershipOTP || !req.session.membershipOTP.verified || req.session.membershipOTP.email !== email) {
        throw new ApiError(401, 'Email verification required before submitting payment.');
    }

    const membershipData = {
        id: 'MEM-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase(),
        email,
        planId,
        planName,
        amount: Number(amount),
        txnId,
        status: 'Pending Verification',
        date: new Date().toISOString()
    };

    // Save to memberships.json
    const dbPath = path.join(process.cwd(), 'data', 'memberships.json');
    let memberships = [];
    
    // Ensure data dir exists
    if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
        fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
    }

    if (fs.existsSync(dbPath)) {
        try {
            const fileData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            memberships = fileData.memberships || [];
        } catch (e) {
            console.error('Error reading memberships.json:', e);
        }
    }

    memberships.push(membershipData);
    fs.writeFileSync(dbPath, JSON.stringify({ memberships }, null, 2));

    // Clear session so they have to verify anew next time
    delete req.session.membershipOTP;

    return res.status(200).json(
        new ApiResponse(200, { membershipId: membershipData.id }, 'Payment submitted for verification.')
    );
});

module.exports = { requestEmailOTP, verifyEmailOTP, getMembershipPlans, submitPayment };
