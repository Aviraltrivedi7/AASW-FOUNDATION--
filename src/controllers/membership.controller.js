const { catchAsync } = require('../utils/catchAsync');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const { sendOTP, sendMembershipSuccessEmail, sendAdminMembershipNotification } = require('../utils/email');
const { generateCertificatePdf } = require('../services/certificate.service');
const { uploadIdToGoogleDrive } = require('../services/gdrive.service');
const db = require('../services/db.service');
const { getRazorpayKeys, getRazorpayInstance } = require('../config/razorpay');
const crypto = require('crypto');



// Membership plans definition
const MEMBERSHIP_PLANS = [
    {
        id: 'annual',
        name: 'Annual Subscription',
        nameHi: 'वार्षिक सदस्यता',
        price: 1100,
        duration: 'year',
        tagline: 'Standard 1-year membership',
        badge: '',
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
        badge: '',
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

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/membership/send-otp
// ─────────────────────────────────────────────────────────────────────────────
// STRATEGY: Generate OTP → DB save + Email in PARALLEL → Respond
// Both run simultaneously so total time = max(DB, Email) not DB + Email.
// We MUST await email before responding because Vercel freezes the container
// after res.json(), killing any background promises.
// ─────────────────────────────────────────────────────────────────────────────
const requestEmailOTP = catchAsync(async (req, res) => {
    const { email, name, phone, pan, address, idDocument, idDocumentType } = req.body;

    if (!email || !isValidEmail(email)) {
        throw new ApiError(400, 'Please enter a valid email address.');
    }
    if (!address || !address.trim()) {
        throw new ApiError(400, 'Residential address is required.');
    }
    if (!idDocument || !idDocument.trim()) {
        throw new ApiError(400, 'ID Proof document upload is required.');
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const devMode = (!process.env.SMTP_USER || !process.env.SMTP_PASS);

    // Upload ID Proof document to Google Drive folder 1wURe11fbvl2uI_EF7tfJVHxPALEYyJKA
    let driveIdDocUrl = idDocument || '';
    try {
        driveIdDocUrl = await uploadIdToGoogleDrive(idDocument, idDocumentType || 'ID_Proof', name || 'Member');
    } catch (gerr) {
        console.warn('[Membership] Google Drive upload notice:', gerr.message);
    }

    //  Run DB save + Email send in PARALLEL (not sequential)
    // This cuts total time to max(DB, Email) instead of DB + Email
    const startTime = Date.now();

    const [dbResult, emailResult] = await Promise.allSettled([
        // Task 1: Save OTP to database
        db.upsertOtp({
            email,
            name: name || '',
            phone: phone || '',
            pan: pan || '',
            address: address.trim(),
            idDocument: driveIdDocUrl,
            idDocumentType: idDocumentType || 'Aadhaar Card',
            otp,
            expires_at: expiresAt,
            verified: false
        }),
        // Task 2: Send OTP email (only if not dev mode)
        devMode
            ? Promise.resolve(true)
            : sendOTP(email, otp)
    ]);

    const elapsed = Date.now() - startTime;

    if (dbResult.status === 'rejected' || (dbResult.status === 'fulfilled' && !dbResult.value?.success)) {
        let errDetail = dbResult.status === 'rejected' ? (dbResult.reason?.message || dbResult.reason) : dbResult.value?.error;
        if (typeof errDetail === 'object') errDetail = JSON.stringify(errDetail);
        console.error(`[OTP] DB save failed for ${email}:`, errDetail);
        throw new ApiError(500, `Database Configuration Error: Please ensure MONGODB_URI or INSFORGE_URL is set in Vercel. Error: ${errDetail}`);
    }

    let emailSent = true;
    let emailErrorMsg = '';
    if (emailResult.status === 'rejected') {
        emailErrorMsg = emailResult.reason?.message || String(emailResult.reason);
        console.error(`[OTP] Email send FAILED for ${email}:`, emailErrorMsg);
        emailSent = false;
    } else if (emailResult.value === false) {
        emailErrorMsg = 'SMTP returned false';
        console.error(`[OTP] Email returned false for ${email} — SMTP error`);
        emailSent = false;
    }

    console.log(`[OTP] Parallel tasks done in ${elapsed}ms for ${email} | DB: ${dbResult.status} | Email: ${emailSent ? 'sent' : 'FAILED'}`);

    if (!devMode && !emailSent) {
        const u = process.env.SMTP_USER || '';
        const p = process.env.SMTP_PASS || '';
        const debug = `[Vercel Env Debug: user='${u}', len=${p.length}, mask='${p ? p[0] + '...' + p.slice(-1) : 'none'}']`;
        throw new ApiError(500, `Failed to send verification email ${debug}: ${emailErrorMsg}. Please try again.`);
    }

    res.status(200).json(
        new ApiResponse(200, {
            email,
            devMode,
            devOtp: devMode ? otp : undefined
        }, devMode
            ? `[DEV MODE] OTP sent to console. Check your server logs.`
            : `OTP sent to ${email}. Valid for 5 minutes.`
        )
    );
});


// POST /api/v1/membership/verify-otp
const verifyEmailOTP = catchAsync(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError(400, 'Email address and OTP are required.');
    }

    // Find OTP via hybrid service (MongoDB first, InsForge fallback)
    const sessionOTP = await db.findOtpByEmail(email);

    if (!sessionOTP) {
        throw new ApiError(400, 'No OTP found. Please request a new OTP.');
    }

    if (new Date() > new Date(sessionOTP.expires_at)) {
        await db.deleteOtpByEmail(email);
        throw new ApiError(400, 'OTP has expired. Please request a new OTP.');
    }

    if (sessionOTP.otp !== otp.toString()) {
        throw new ApiError(400, 'Invalid OTP. Please check and try again.');
    }

    // Mark as verified
    await db.updateOtpVerified(email);

    // Generate signed verification token
    const jwt = require('jsonwebtoken');
    const verificationToken = jwt.sign(
        { email: email.trim().toLowerCase(), verified: true },
        process.env.JWT_SECRET || 'development_secret_key_1234567890_aasw',
        { expiresIn: '2h' }
    );

    // Create a temporary cookie as a secondary measure (stateless fallback)
    const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
    res.cookie('verified_email', email, { 
        httpOnly: true, 
        secure: isHttps, 
        sameSite: 'lax',
        maxAge: 3600000 
    });

    return res.status(200).json(
        new ApiResponse(200, { email, verified: true, token: verificationToken }, 'Email address verified successfully!')
    );
});

// GET /api/v1/membership/plans
const getMembershipPlans = catchAsync(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, { plans: MEMBERSHIP_PLANS }, 'Membership plans fetched successfully.')
    );
});

// Helper validation module using stateless OTPs
async function validateVerifiedUser(email, req) {
    if (!email) throw new ApiError(400, 'Email address is required.');
    email = email.trim().toLowerCase();

    // 1. In-memory fast verification check (immune to database sync delays)
    const inMemoryOk = db.isEmailVerifiedInMemory && db.isEmailVerifiedInMemory(email);

    // 2. Check signed JWT token in Authorization header or body
    let tokenValid = false;
    const authHeader = req.headers.authorization;
    const bearerToken = (authHeader && authHeader.startsWith('Bearer ')) 
        ? authHeader.split(' ')[1] 
        : (req.body?.token || req.query?.token);

    if (bearerToken) {
        try {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET || 'development_secret_key_1234567890_aasw');
            if (decoded && decoded.email?.toLowerCase() === email && decoded.verified) {
                tokenValid = true;
            }
        } catch (_) {}
    }

    // 3. Check cookie
    const cookieValid = req.cookies && req.cookies.verified_email?.toLowerCase() === email;

    // 4. Check database record
    const otpData = await db.findOtpByEmail(email);

    if (otpData && otpData.verified) {
        return otpData;
    }

    if (inMemoryOk || tokenValid || cookieValid) {
        return {
            email,
            verified: true,
            name: otpData?.name || req.body?.name || 'Member',
            phone: otpData?.phone || req.body?.phone || '',
            pan: otpData?.pan || req.body?.pan || '',
            address: otpData?.address || req.body?.address || '',
            idDocument: otpData?.idDocument || req.body?.idDocument || '',
            idDocumentType: otpData?.idDocumentType || req.body?.idDocumentType || 'Aadhaar Card'
        };
    }

    throw new ApiError(401, 'Session invalid or email verification required.');
}

// POST /api/v1/membership/submit-payment
const submitPayment = catchAsync(async (req, res) => {
    const { email, planId, planName, amount, txnId } = req.body;

    if (!email || !planId || !amount || !txnId) {
        throw new ApiError(400, 'All payment details are required including Transaction ID.');
    }

    const userData = await validateVerifiedUser(email, req);

    // Check if user already has an active membership
    const existingMember = await db.findMemberByEmail(email);
    if (existingMember && existingMember.status === 'Active') {
        throw new ApiError(400, 'You already have an active membership. Thank you for your support!');
    }

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

    const memberRecord = {
        name: membershipData.name,
        email: membershipData.email,
        phone: userData.phone || '',
        payment_id: txnId,
        status: 'Pending Verification',
        planId: planId,
        planName: planName || (planId === 'lifetime' ? 'Lifetime Membership' : 'Annual Subscription'),
        amount: Number(amount),
        pan: userData.pan || '',
        address: userData.address || req.body.address || '',
        idDocument: userData.idDocument || req.body.idDocument || '',
        idDocumentType: userData.idDocumentType || req.body.idDocumentType || 'Aadhaar Card'
    };
    await db.insertMember(memberRecord);

    // Send instant Admin Email Alert
    sendAdminMembershipNotification(memberRecord).catch(err => {
        console.warn("[Membership] Admin email alert error on submitPayment:", err.message);
    });

    // Clear verification after initiating manual submission to prevent reuse
    res.clearCookie('verified_email');
    await db.deleteOtpByEmail(email);

    return res.status(200).json(
        new ApiResponse(200, { membershipId: membershipData.id }, 'Payment submitted for verification.')
    );
});

// POST /api/v1/membership/create-order
const createRazorpayOrder = catchAsync(async (req, res) => {
    const { email, planId, amount, planName, pan } = req.body;

    if (!email || !planId) {
        throw new ApiError(400, 'All details are required to create an order.');
    }

    // Lookup actual plan to prevent price tampering
    const plan = MEMBERSHIP_PLANS.find(p => p.id === planId);
    if (!plan) {
        throw new ApiError(400, 'Invalid membership plan selected.');
    }
    const secureAmount = plan.price;
    const securePlanName = plan.name;

    const userData = await validateVerifiedUser(email, req);

    // Prevent duplicate memberships
    const existingMember = await db.findMemberByEmail(email);
    if (existingMember && existingMember.status === 'Active') {
        throw new ApiError(400, 'You already have an active membership. Thank you for your support!');
    }

    const { keyId } = getRazorpayKeys();
    const razorpay = getRazorpayInstance();

    const options = {
        amount: Math.round(secureAmount * 100), // amount in smallest currency unit (paise)
        currency: 'INR',
        receipt: 'rec_' + Date.now(),
        notes: {
            email,
            planId,
            planName: securePlanName,
            name: userData.name,
            phone: userData.phone,
            pan: pan || userData.pan || '',
            address: req.body.address || userData.address || '',
            idDocumentType: req.body.idDocumentType || userData.idDocumentType || 'Aadhaar Card'
        }
    };

    let order;
    try {
        order = await razorpay.orders.create(options);
    } catch (err) {
        console.error('[Razorpay] Order creation failed:', err);
        throw new ApiError(err.statusCode || 500, err.error?.description || err.message || 'Failed to create Razorpay order');
    }

    if (!order) {
        throw new ApiError(500, 'Failed to create Razorpay order');
    }

    return res.status(200).json(
        new ApiResponse(200, {
            orderId: order.id,
            amount: order.amount,
            keyId: keyId
        }, 'Order created successfully')
    );
});

// POST /api/v1/membership/verify-payment
const verifyRazorpayPayment = catchAsync(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !email) {
        throw new ApiError(400, 'Missing payment verification details.');
    }

    const userData = await validateVerifiedUser(email, req);

    const { keySecret } = getRazorpayKeys();
    const secret = keySecret;
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature !== razorpay_signature) {
        throw new ApiError(400, 'Invalid payment signature.');
    }

    // Fetch the original order to prevent tampering with planId, pan, or amount
    const razorpay = getRazorpayInstance();
    
    let order;
    try {
        order = await razorpay.orders.fetch(razorpay_order_id);
    } catch (err) {
        throw new ApiError(500, 'Failed to fetch order details from payment gateway.');
    }

    if (!order || order.notes.email !== email) {
        throw new ApiError(400, 'Order details mismatch or invalid order.');
    }

    const securePlanId = order.notes.planId;
    const securePan = order.notes.pan || '';
    const secureAddress = order.notes.address || userData.address || '';
    const secureIdDocType = order.notes.idDocumentType || userData.idDocumentType || 'Aadhaar Card';

    // Upsert member via hybrid DB service — fully automated, no manual admin needed
    const plan = MEMBERSHIP_PLANS.find(p => p.id === securePlanId);
    const memberRecord = {
        name: userData.name || 'Member', 
        email: email,
        phone: userData.phone || '',
        payment_id: razorpay_payment_id,
        status: 'Active',
        verified: true,
        planId: securePlanId,
        planName: plan ? plan.name : (securePlanId === 'lifetime' ? 'Lifetime Membership' : 'Annual Subscription'),
        amount: plan ? plan.price : (order.amount / 100),
        pan: securePan || userData.pan || '',
        address: secureAddress,
        idDocument: userData.idDocument || '',
        idDocumentType: secureIdDocType
    };

    // If ID document is raw base64 (Drive upload failed during OTP), retry Drive upload now
    if (memberRecord.idDocument && memberRecord.idDocument.startsWith('data:')) {
        try {
            console.log('[Membership] Base64 ID detected during payment verification. Uploading to Google Drive...');
            const driveUrl = await uploadIdToGoogleDrive(memberRecord.idDocument, memberRecord.idDocumentType || 'ID_Proof', memberRecord.name);
            if (driveUrl && driveUrl.startsWith('http')) {
                memberRecord.idDocument = driveUrl;
                console.log('[Membership] Successfully uploaded ID to Google Drive:', driveUrl);
            }
        } catch (err) {
            console.warn('[Membership] Google Drive auto-upload retry error:', err.message);
        }
    }

    await db.upsertMember(memberRecord);
    clearFeaturedCache();

    res.clearCookie('verified_email');
    await db.deleteOtpByEmail(email);

    // Send instant Admin Email Alert so NGO Admin knows immediately when someone joins!
    sendAdminMembershipNotification(memberRecord).catch(err => {
        console.warn("[Membership] Admin email alert error:", err.message);
    });

    // Generate and email certificate BEFORE responding (Vercel kills background tasks after response)
    try {
        const shortId = razorpay_payment_id.slice(-5).toUpperCase();
        const currentYear = new Date().getFullYear();
        const formattedId = `AASW-${currentYear}-${shortId}`;
        const planStr = (securePlanId === 'annual') ? '1 Year' : 'Lifetime';
        const pdfBuffer = await generateCertificatePdf(userData.name || 'Member', formattedId, planStr);
        await sendMembershipSuccessEmail(email, userData.name || 'Member', pdfBuffer);
        console.log("[Membership] Successfully emailed certificate to: " + email);
    } catch(err) {
        console.error("[Membership] Error generating/emailing certificate:", err.message);
        // Don't throw — payment is already verified, cert email failure shouldn't block success
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

    const bodyText = req.rawBody ? req.rawBody.toString('utf8') : ((req.body instanceof Buffer) ? req.body.toString('utf8') : JSON.stringify(req.body));

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
            
            // 1. Check if member already processed by synchronous route
            const existingMember = await db.findMemberByPaymentId(payment.id);
            
            if (!existingMember) {
                // 2. Upsert the member — fully automated from webhook
                const webhookPlanId = notes.planId || 'annual';
                const webhookMemberRecord = {
                    name: notes.name || 'Member', 
                    email: notes.email || payment.email,
                    phone: notes.phone || '',
                    payment_id: payment.id,
                    status: 'Active',
                    verified: true,
                    planId: webhookPlanId,
                    planName: webhookPlanId === 'lifetime' ? 'Lifetime Membership' : 'Annual Subscription',
                    amount: payment.amount / 100,
                    pan: notes.pan || '',
                    address: notes.address || '',
                    idDocument: notes.idDocument || '',
                    idDocumentType: notes.idDocumentType || 'Aadhaar Card'
                };

                if (webhookMemberRecord.idDocument && webhookMemberRecord.idDocument.startsWith('data:')) {
                    try {
                        const driveUrl = await uploadIdToGoogleDrive(webhookMemberRecord.idDocument, webhookMemberRecord.idDocumentType || 'ID_Proof', webhookMemberRecord.name);
                        if (driveUrl && driveUrl.startsWith('http')) {
                            webhookMemberRecord.idDocument = driveUrl;
                        }
                    } catch (err) {
                        console.warn('[Webhook] Google Drive upload error:', err.message);
                    }
                }

                await db.upsertMember(webhookMemberRecord);
                clearFeaturedCache();

                // Send instant Admin Email Alert
                sendAdminMembershipNotification(webhookMemberRecord).catch(err => {
                    console.warn("[Webhook] Admin email alert error:", err.message);
                });

                // 3. Email Certificate (Webhook Fallback)
                try {
                    const emailToUse = notes.email || payment.email;
                    const nameToUse = notes.name || 'Member';
                    const shortId = payment.id.slice(-5).toUpperCase();
                    const currentYear = new Date().getFullYear();
                    const formattedId = `AASW-${currentYear}-${shortId}`;
                    const planStr = (notes.planId === 'annual') ? '1 Year' : 'Lifetime';
                    
                    const pdfBuffer = await generateCertificatePdf(nameToUse, formattedId, planStr);
                    await sendMembershipSuccessEmail(emailToUse, nameToUse, pdfBuffer);
                    console.log(`[Webhook] Successfully emailed certificate to: ${emailToUse}`);
                } catch(err) {
                    console.error("[Webhook] Error generating/emailing certificate:", err.message);
                }
            } else {
                console.log(`[Webhook] Member for payment ${payment.id} already processed synchronously. Skipping email.`);
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
    
    // Fetch member data via hybrid service
    const data = await db.findMemberByPaymentId(paymentId);
    if (data) {
        if (data.name) memberName = data.name;
        if (data.planId === 'lifetime') planStr = 'Lifetime';
    }
    
    // Generate PDF
    const shortId = paymentId.slice(-5).toUpperCase();
    const currentYear = new Date().getFullYear();
    const formattedId = `AASW-${currentYear}-${shortId}`;
    
    const pdfBuffer = await generateCertificatePdf(memberName, formattedId, planStr);
    
    // Send standard PDF response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="AASW-Certificate-${paymentId}.pdf"`);
    res.send(Buffer.from(pdfBuffer));
});

// GET /api/v1/membership/featured
// ─── FEATURED MEMBERS CACHE (instant response, no cold-start delay) ───
let _featuredCache = null;        // cached array of members
let _featuredCacheTime = 0;       // timestamp of last successful fetch
const FEATURED_CACHE_TTL = 2 * 60 * 1000; // 2 minutes
let _featuredRefreshing = false;  // prevent parallel refreshes

function clearFeaturedCache() {
    _featuredCache = null;
    _featuredCacheTime = 0;
    console.log('[FeaturedCache] Cache cleared for fresh active members fetch.');
}

async function _refreshFeaturedCache() {
    if (_featuredRefreshing) return;
    _featuredRefreshing = true;
    try {
        const members = await db.getActiveMembers();
        // ONLY update cache if we got real data back (never wipe with empty)
        if (members && members.length > 0) {
            _featuredCache = members;
            _featuredCacheTime = Date.now();
            console.log(`[FeaturedCache] Refreshed — ${members.length} members cached`);
        } else if (!_featuredCache) {
            // First ever load and DB returned empty — store empty
            _featuredCache = [];
            _featuredCacheTime = Date.now();
        }
        // If DB returned empty but we have old cache, keep old cache (don't wipe names)
    } catch (err) {
        console.warn('[FeaturedCache] Refresh failed, keeping old cache:', err.message);
        // Never wipe existing cache on error
    } finally {
        _featuredRefreshing = false;
    }
}

const getFeaturedMembers = catchAsync(async (req, res) => {
    const now = Date.now();
    const cacheAge = now - _featuredCacheTime;

    // If cache is fresh, serve instantly
    if (_featuredCache && cacheAge < FEATURED_CACHE_TTL) {
        return res.status(200).json(
            new ApiResponse(200, _featuredCache, 'Featured active members fetched successfully.')
        );
    }

    // If we have stale cache, serve it immediately AND refresh in background
    if (_featuredCache && _featuredCache.length > 0) {
        // Trigger background refresh (don't await)
        _refreshFeaturedCache();
        return res.status(200).json(
            new ApiResponse(200, _featuredCache, 'Featured active members fetched successfully.')
        );
    }

    // No cache at all — first ever request, must wait
    await _refreshFeaturedCache();
    return res.status(200).json(
        new ApiResponse(200, _featuredCache || [], 'Featured active members fetched successfully.')
    );
});

// Pre-warm the cache on server startup (runs after 3 seconds)
setTimeout(() => _refreshFeaturedCache(), 3000);

// POST /api/v1/membership/reconcile
const reconcilePayments = catchAsync(async (req, res) => {
    const razorpay = getRazorpayInstance();

    const payments = await razorpay.payments.all({ count: 100 });
    const capturedPayments = payments.items.filter(p => p.status === 'captured');
    let reconciledCount = 0;

    for (const p of capturedPayments) {
        const existingMember = await db.findMemberByPaymentId(p.id);
        if (!existingMember) {
            const notes = p.notes || {};
            const nameToUse = notes.name || 'Member';
            const emailToUse = notes.email || p.email;
            const phoneToUse = notes.phone || p.contact || '';
            const panToUse = notes.pan || '';
            const addressToUse = notes.address || '';
            const planIdToUse = notes.planId || 'annual';

            await db.upsertMember({
                name: nameToUse,
                email: emailToUse,
                phone: phoneToUse,
                payment_id: p.id,
                status: 'Active',
                planId: planIdToUse,
                pan: panToUse,
                address: addressToUse,
                idDocumentType: notes.idDocumentType || 'Aadhaar Card'
            });

            try {
                const shortId = p.id.slice(-5).toUpperCase();
                const currentYear = new Date().getFullYear();
                const formattedId = `AASW-${currentYear}-${shortId}`;
                const planStr = (planIdToUse === 'annual') ? '1 Year' : 'Lifetime';

                const pdfBuffer = await generateCertificatePdf(nameToUse, formattedId, planStr);
                await sendMembershipSuccessEmail(emailToUse, nameToUse, pdfBuffer);
                reconciledCount++;
            } catch (e) {
                console.error('[Reconcile] Error generating/emailing cert:', e.message);
            }
        }
    }

    return res.status(200).json(
        new ApiResponse(200, { reconciledCount, totalCaptured: capturedPayments.length }, `Reconciliation complete. ${reconciledCount} payments processed.`)
    );
});

module.exports = { getFeaturedMembers, downloadCertificate, requestEmailOTP, verifyEmailOTP, getMembershipPlans, submitPayment, createRazorpayOrder, verifyRazorpayPayment, razorpayWebhook, reconcilePayments };

