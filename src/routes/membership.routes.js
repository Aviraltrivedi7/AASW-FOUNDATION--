const express = require('express');
const Joi = require('joi');
const { validate } = require('../middlewares/validation.middleware');
const { getFeaturedMembers, requestEmailOTP, verifyEmailOTP, getMembershipPlans, submitPayment, createRazorpayOrder, verifyRazorpayPayment, downloadCertificate, razorpayWebhook } = require('../controllers/membership.controller');
const { generateCertificatePdf } = require('../services/certificate.service');

const router = express.Router();

const sendOtpSchema = Joi.object({
    name: Joi.string().min(2).required().messages({ 'string.min': 'Name must be at least 2 characters.' }),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({ 'string.pattern.base': 'Enter a valid 10-digit mobile number.' }),
    email: Joi.string().email().required()
        .messages({ 'string.email': 'Enter a valid email address.' }),
    pan: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i).optional()
});

const verifyOtpSchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required()
        .messages({ 'string.length': 'OTP must be 6 digits.' })
});

const submitPaymentSchema = Joi.object({
    email: Joi.string().email().required(),
    planId: Joi.string().required(),
    planName: Joi.string().required(),
    amount: Joi.number().required(),
    txnId: Joi.string().min(5).required().messages({ 'string.min': 'Please enter a valid Transaction ID/UTR.' })
});

const createOrderSchema = Joi.object({
    email: Joi.string().email().required(),
    planId: Joi.string().required(),
    planName: Joi.string().required(),
    amount: Joi.number().required(),
    pan: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i).optional()
});

const verifyPaymentSchema = Joi.object({
    email: Joi.string().email().required(),
    planId: Joi.string().required(),
    planName: Joi.string().required(),
    amount: Joi.number().required(),
    razorpay_order_id: Joi.string().required(),
    razorpay_payment_id: Joi.string().required(),
    razorpay_signature: Joi.string().required(),
    pan: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i).optional()
});

router.post('/send-otp', validate(sendOtpSchema), requestEmailOTP);
router.post('/verify-otp', validate(verifyOtpSchema), verifyEmailOTP);
router.post('/submit-payment', validate(submitPaymentSchema), submitPayment);
router.post('/create-order', validate(createOrderSchema), createRazorpayOrder);
router.post('/verify-payment', validate(verifyPaymentSchema), verifyRazorpayPayment);
router.get('/plans', getMembershipPlans);
router.get('/certificate/:paymentId', downloadCertificate);
router.get('/featured', getFeaturedMembers);

// Webhook payload validated by HMAC, so no Joi schema needed for body payload generically
router.post('/webhook', express.raw({ type: 'application/json' }), razorpayWebhook);

// ── DEV PREVIEW ROUTE ────────────────────────────────────────────────────────
// Visit: http://localhost:3000/api/v1/membership/preview-cert?type=annual
// Visit: http://localhost:3000/api/v1/membership/preview-cert?type=lifetime
router.get('/preview-cert', async (req, res) => {
    try {
        const type = req.query.type === 'lifetime' ? 'Lifetime' : '1 Year';
        const name = req.query.name || 'Rahul Sharma';
        const id = req.query.id || 'AASW-2025-001';
        const pdfBytes = await generateCertificatePdf(name, id, type);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="preview-certificate.pdf"');
        res.send(Buffer.from(pdfBytes));
    } catch (err) {
        console.error('Preview cert error:', err);
        res.status(500).send('Error generating certificate preview: ' + err.message);
    }
});

module.exports = router;
