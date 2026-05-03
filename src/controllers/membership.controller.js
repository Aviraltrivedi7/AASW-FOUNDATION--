const { catchAsync } = require('../utils/catchAsync');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const { sendOTP, sendMembershipSuccessEmail } = require('../utils/email');
const { generateCertificatePdf } = require('../services/certificate.service');
const { insforge } = require('../config/insforge');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// In-memory fallback if InsForge RLS policies block inserts (which causes 500 errors)
const fallbackOtpStore = {};

// Membership plans definition
const MEMBERSHIP_PLANS = [
    {
        id: 'annual',
        name: 'Annual Subscription',
        nameHi: 'वार्षिक सदस्यता',
        price: 1100,
        duration: 'year',
        tagline: 'Standard 1-year membership',
        badge: '🌟',
        color: '#1a73e8',
        popular: true,
        features: [
            'Digital membership certificate',
            'Impact updates & reports',
            'Member-only community access',
            'Volunteer opportunities'
        ]
    },
    {
        id: 'lifetime',
        name: 'Lifetime Membership',
        nameHi: 'आजीवन सदस्यता',
        price: 10000,
        duration: 'lifetime',
        tagline: 'Become a permanent member',
        badge: '🏆',
        color: '#d97706',
        features: [
            'All Annual benefits (lifetime access)',
            'Name featured on website',
            'Recognition plaque',
            'Special recognition at events',
            'Direct impact updates from field teams'
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
    const { email, name, phone, pan } = req.body;

    if (!email || !isValidEmail(email)) {
        throw new ApiError(400, 'Please enter a valid email address.');
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    // Use insforge to bypass RLS — inserts via server should never be blocked
    let dbError = null;
    if (insforge) {
        const { error } = await insforge.database.from('otps').upsert({
            email, name: name || '', phone: phone || '', pan: pan || '', otp, expires_at: expiresAt, verified: false
        });
        if (error) {
            dbError = error;
            console.warn("[OTP] InsForge upsert failed, using in-memory fallback:", error.message);
        }
    }

    if (!insforge || dbError) {
        fallbackOtpStore[email] = { otp, expires_at: expiresAt, verified: false, name, phone, pan: pan || '' };
    }

    const devMode = (!process.env.SMTP_USER || !process.env.SMTP_PASS);
    const responseMsg = devMode
        ? `[DEV MODE] OTP sent to console. Check your server logs.`
        : `OTP sent to ${email}. Valid for 5 minutes.`;

    // Respond IMMEDIATELY — don't wait for email to send
    // In dev mode, return OTP to frontend for easy testing
    res.status(200).json(
        new ApiResponse(200, { email, devMode, devOtp: devMode ? otp : undefined }, responseMsg)
    );

    // Send email in background (fire-and-forget)
    sendOTP(email, otp).then(sent => {
        if (!sent) console.error(`[Membership] Failed to send OTP email to ${email}`);
        else console.log(`[Membership] OTP sent to ${email}: ${otp}`);
    }).catch(err => {
        console.error(`[Membership] Email error for ${email}:`, err.message);
    });
});

// POST /api/v1/membership/verify-otp
const verifyEmailOTP = catchAsync(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError(400, 'Email address and OTP are required.');
    }

    let sessionOTP = null;
    let fallback = fallbackOtpStore[email];

    if (insforge) {
        const { data, error } = await insforge.database.from('otps').select('*').eq('email', email).single();
        if (!error && data) sessionOTP = data;
    }

    if (!sessionOTP && fallback) {
        sessionOTP = fallback;
    }

    if (!sessionOTP) {
        throw new ApiError(400, 'No OTP found. Please request a new OTP.');
    }

    if (new Date() > new Date(sessionOTP.expires_at)) {
        if (insforge) await insforge.database.from('otps').delete().eq('email', email);
        if (fallback) delete fallbackOtpStore[email];
        throw new ApiError(400, 'OTP has expired. Please request a new OTP.');
    }

    if (sessionOTP.otp !== otp.toString()) {
        throw new ApiError(400, 'Invalid OTP. Please check and try again.');
    }

    // Mark as verified
    if (insforge) await insforge.database.from('otps').update({ verified: true }).eq('email', email);
    if (fallback) fallbackOtpStore[email].verified = true;

    // Create a temporary cookie as a secondary measure (stateless fallback)
    res.cookie('verified_email', email, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 3600000 });

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

// Helper validation module using stateless OTps
async function validateVerifiedUser(email, req) {
    // Check cookie first
    if (req.cookies && req.cookies.verified_email === email) {
        return { email, verified: true, name: 'Member' };
    }
    
    let isVerified = false;
    let userData = {};

    if (insforge) {
        const { data, error } = await insforge.database.from('otps').select('*').eq('email', email).single();
        if (!error && data && data.verified) {
            isVerified = true;
            userData = data;
        }
    }

    if (!isVerified && fallbackOtpStore[email] && fallbackOtpStore[email].verified) {
        isVerified = true;
        userData = fallbackOtpStore[email];
    }
    
    if (!isVerified) {
        throw new ApiError(401, 'Session invalid or email verification required.');
    }
    return userData;
}

// POST /api/v1/membership/submit-payment
const submitPayment = catchAsync(async (req, res) => {
    const { email, planId, planName, amount, txnId } = req.body;

    if (!email || !planId || !amount || !txnId) {
        throw new ApiError(400, 'All payment details are required including Transaction ID.');
    }

    const userData = await validateVerifiedUser(email, req);

    const membershipData = {
        id: 'MEM-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase(),
        email,
        name: userData.name || 'Member',
        planId,
        planName,
        amount: Number(amount),
        txnId,
        status: 'Pending Verification',
        date: new Date().toISOString()
    };

    if (insforge) {
        await insforge.database.from('members').insert([{
            name: membershipData.name,
            email: membershipData.email,
            payment_id: txnId,
            status: 'Pending Verification',
            planId: planId,
            pan: userData.pan || ''
        }]);
    }

    // Clear verification after initiating manual submission to prevent reuse
    res.clearCookie('verified_email');
    if (insforge) await insforge.database.from('otps').delete().eq('email', email);
    if (fallbackOtpStore[email]) delete fallbackOtpStore[email];

    return res.status(200).json(
        new ApiResponse(200, { membershipId: membershipData.id }, 'Payment submitted for verification.')
    );
});

// POST /api/v1/membership/create-order
const createRazorpayOrder = catchAsync(async (req, res) => {
    const { email, planId, amount, planName, pan } = req.body;

    if (!email || !planId || !amount) {
        throw new ApiError(400, 'All details are required to create an order.');
    }

    const userData = await validateVerifiedUser(email, req);

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new ApiError(500, 'Payment gateway not configured. Contact admin.');
    }

    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const options = {
        amount: Math.round(Number(amount) * 100), // amount in smallest currency unit (paise)
        currency: 'INR',
        receipt: 'rec_' + Date.now(),
        notes: {
            email,
            planId,
            planName,
            name: userData.name,
            phone: userData.phone,
            pan: pan || ''
        }
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
        throw new ApiError(500, 'Failed to create Razorpay order');
    }

    return res.status(200).json(
        new ApiResponse(200, {
            orderId: order.id,
            amount: order.amount,
            keyId: process.env.RAZORPAY_KEY_ID
        }, 'Order created successfully')
    );
});

// POST /api/v1/membership/verify-payment
const verifyRazorpayPayment = catchAsync(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email, planId, planName, amount, pan } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !email) {
        throw new ApiError(400, 'Missing payment verification details.');
    }

    const userData = await validateVerifiedUser(email, req);

    if (!process.env.RAZORPAY_KEY_SECRET) {
        throw new ApiError(500, 'Payment gateway not configured. Contact admin.');
    }
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature !== razorpay_signature) {
        throw new ApiError(400, 'Invalid payment signature.');
    }

    // Insert into InsForge
    if (insforge) {
        const { error } = await insforge.database
            .from('members')
            .upsert([{ 
                name: userData.name || 'Member', 
                email: email, 
                payment_id: razorpay_payment_id,
                status: 'Active',
                planId: planId,
                pan: pan || userData.pan || ''
            }], { onConflict: 'payment_id' });
            
        if (error) {
            console.error("[InsForge] Insert Error:", error);
        }
    }

    res.clearCookie('verified_email');
    if (insforge) await insforge.database.from('otps').delete().eq('email', email);
    if (fallbackOtpStore[email]) delete fallbackOtpStore[email];

    // Generate and email certificate
    try {
        const shortId = razorpay_payment_id.slice(-5).toUpperCase();
        const formattedId = `AASW-2025-${shortId}`;
        const planStr = (planId === 'annual') ? '1 Year' : 'Lifetime';
        const pdfBuffer = await generateCertificatePdf(userData.name || 'Member', formattedId, planStr);
        await sendMembershipSuccessEmail(email, userData.name || 'Member', pdfBuffer);
        console.log("[Membership] Successfully emailed certificate to: " + email);
    } catch(err) {
        console.error("[Membership] Error generating/emailing certificate:", err);
    }

    return res.status(200).json(
        new ApiResponse(200, { membershipId: razorpay_payment_id }, 'Payment verified successfully.')
    );
});

// POST /api/v1/membership/webhook
const razorpayWebhook = catchAsync(async (req, res) => {
    // Note: express.raw middleware implies req.body might be a Buffer if configured correctly,
    // but in Express default JSON parsing, we just stringify the parsed object.
    // For perfect HMAC validation, raw body is preferred in production.
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) return res.status(500).send('Webhook not configured');
    
    const signature = req.headers['x-razorpay-signature'];
    if (!signature) return res.status(400).send('Signature missing');

    const bodyText = (req.body instanceof Buffer) ? req.body.toString('utf8') : JSON.stringify(req.body);

    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(bodyText)
        .digest('hex');

    if (expectedSignature !== signature) {
        return res.status(400).send('Invalid signature');
    }

    try {
        const payload = JSON.parse(bodyText);
        if (payload.event === 'payment.captured' || payload.event === 'payment.authorized') {
            const payment = payload.payload.payment.entity;
            const notes = payment.notes || {};
            
            if (insforge) {
                const { error } = await insforge.database.from('members').upsert([{ 
                    name: notes.name || 'Member', 
                    email: notes.email || payment.email, 
                    payment_id: payment.id,
                    status: 'Active',
                    planId: notes.planId,
                    pan: notes.pan || ''
                }], { onConflict: 'payment_id' });
                if (error) console.error('[Webhook] Member insert error:', error.message);
            }
        }
    } catch (e) {
        console.error("Webhook processing error", e);
    }

    res.status(200).send('OK');
});

// GET /api/v1/membership/certificate/:paymentId
const downloadCertificate = catchAsync(async (req, res) => {
    const { paymentId } = req.params;
    let memberName = 'Member';
    let planStr = '1 Year'; // default
    
    // Single DB query to fetch both name and plan
    if (insforge) {
        const { data, error } = await insforge.database.from('members').select('name, planId').eq('payment_id', paymentId).single();
        if (!error && data) {
            if (data.name) memberName = data.name;
            if (data.planId === 'lifetime') planStr = 'Lifetime';
        }
    }
    
    // Generate PDF
    const shortId = paymentId.slice(-5).toUpperCase();
    const formattedId = `AASW-2025-${shortId}`;
    
    const pdfBuffer = await generateCertificatePdf(memberName, formattedId, planStr);
    
    // Send standard PDF response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="AASW-Certificate-${paymentId}.pdf"`);
    res.send(Buffer.from(pdfBuffer));
});

module.exports = { downloadCertificate, requestEmailOTP, verifyEmailOTP, getMembershipPlans, submitPayment, createRazorpayOrder, verifyRazorpayPayment, razorpayWebhook };
