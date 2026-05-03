const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    name: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    pan: {
        type: String,
        default: ''
    },
    otp: {
        type: String,
        required: true
    },
    expires_at: {
        type: Date,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    }
});

// TTL index — automatically delete expired OTP documents after 10 minutes
otpSchema.index({ expires_at: 1 }, { expireAfterSeconds: 600 });

module.exports = mongoose.model('Otp', otpSchema);
