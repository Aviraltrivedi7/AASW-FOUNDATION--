const express = require('express');
const Joi = require('joi');
const { validate } = require('../middlewares/validation.middleware');
const { createDonationOrder, verifyDonationPayment } = require('../controllers/donation.controller');

const router = express.Router();

const createOrderSchema = Joi.object({
    email: Joi.string().email().required().messages({ 'string.email': 'Enter a valid email address.' }),
    name: Joi.string().min(2).required().messages({ 'string.min': 'Name must be at least 2 characters.' }),
    phone: Joi.string().pattern(/^[0-9]{10}$/).allow('').optional().messages({ 'string.pattern.base': 'Enter a valid 10-digit mobile number.' }),
    pan: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i).allow('').optional().messages({ 'string.pattern.base': 'Enter a valid 10-character PAN number.' }),
    amount: Joi.number().min(100).required().messages({ 'number.min': 'Minimum donation amount is ₹100.' }),
    initiative: Joi.string().optional()
});

const verifyPaymentSchema = Joi.object({
    email: Joi.string().email().required(),
    razorpay_order_id: Joi.string().required(),
    razorpay_payment_id: Joi.string().required(),
    razorpay_signature: Joi.string().required()
});

router.post('/create-order', validate(createOrderSchema), createDonationOrder);
router.post('/verify-payment', validate(verifyPaymentSchema), verifyDonationPayment);

module.exports = router;
