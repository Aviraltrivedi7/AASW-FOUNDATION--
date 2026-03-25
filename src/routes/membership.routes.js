const express = require('express');
const Joi = require('joi');
const { validate } = require('../middlewares/validation.middleware');
const { requestEmailOTP, verifyEmailOTP, getMembershipPlans, submitPayment } = require('../controllers/membership.controller');

const router = express.Router();

const sendOtpSchema = Joi.object({
    email: Joi.string().email().required()
        .messages({ 'string.email': 'Enter a valid email address.' })
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

router.post('/send-otp', validate(sendOtpSchema), requestEmailOTP);
router.post('/verify-otp', validate(verifyOtpSchema), verifyEmailOTP);
router.post('/submit-payment', validate(submitPaymentSchema), submitPayment);
router.get('/plans', getMembershipPlans);

module.exports = router;
