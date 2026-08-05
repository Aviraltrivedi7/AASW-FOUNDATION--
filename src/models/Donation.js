const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        default: ''
    },
    pan: {
        type: String,
        default: ''
    },
    amount: {
        type: Number,
        required: true
    },
    initiative: {
        type: String,
        default: 'General Fund'
    },
    payment_id: {
        type: String,
        unique: true,
        sparse: true
    },
    order_id: {
        type: String
    },
    status: {
        type: String,
        default: 'Pending'
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

// Indexes for common queries
donationSchema.index({ email: 1 });
donationSchema.index({ created_at: -1 });

module.exports = mongoose.model('Donation', donationSchema);
