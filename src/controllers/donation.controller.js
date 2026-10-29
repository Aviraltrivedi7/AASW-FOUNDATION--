const { catchAsync } = require('../utils/catchAsync');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const { sendDonationSuccessEmail } = require('../utils/email');
const db = require('../services/db.service');
const { getRazorpayKeys, getRazorpayInstance } = require('../config/razorpay');
const crypto = require('crypto');

// POST /api/v1/donation/create-order
const createDonationOrder = catchAsync(async (req, res) => {
    const { email, name, phone, pan, amount, initiative } = req.body;

    if (!email || !name || !amount) {
        throw new ApiError(400, 'Name, email, and amount are required to create a donation order.');
    }

    const secureAmount = Number(amount);
    if (isNaN(secureAmount) || secureAmount < 100) {
        throw new ApiError(400, 'Minimum donation amount is ₹100.');
    }

    const { keyId } = getRazorpayKeys();
    const razorpay = getRazorpayInstance();

    const options = {
        amount: Math.round(secureAmount * 100), // amount in paise
        currency: 'INR',
        receipt: 'don_rec_' + Date.now(),
        notes: {
            email,
            name,
            phone: phone || '',
            pan: pan || '',
            initiative: initiative || 'General Fund'
        }
    };

    let order;
    try {
        order = await razorpay.orders.create(options);
    } catch (err) {
        console.error('[Razorpay] Donation order creation failed:', err);
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
        }, 'Donation order created successfully')
    );
});

// POST /api/v1/donation/verify-payment
const verifyDonationPayment = catchAsync(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !email) {
        throw new ApiError(400, 'Missing payment verification details.');
    }

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

    // Fetch the original order to prevent tampering with donation metadata
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

    const name = order.notes.name;
    const phone = order.notes.phone || '';
    const securePan = order.notes.pan || '';
    const secureAmount = order.amount / 100; // converted back from paise
    const initiative = order.notes.initiative || 'General Fund';

    // Upsert success donation record in database
    await db.upsertDonation({
        name,
        email,
        phone,
        pan: securePan,
        amount: secureAmount,
        initiative,
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        status: 'Success'
    });

    // Send thank-you email with 80G tax exemption details (fire-and-forget but vercel-safe via waitUntil in app.js or handle before res)
    try {
        await sendDonationSuccessEmail(email, name, secureAmount, razorpay_payment_id, securePan, initiative);
        console.log(`[Donation] Sent success email to ${email}`);
    } catch (err) {
        console.error(`[Donation] Failed to send success email to ${email}:`, err.message);
    }

    return res.status(200).json(
        new ApiResponse(200, { paymentId: razorpay_payment_id }, 'Donation verified and logged successfully. Thank you for your support!')
    );
});

module.exports = { createDonationOrder, verifyDonationPayment };
