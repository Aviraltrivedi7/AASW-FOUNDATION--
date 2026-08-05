const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
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
    subject: {
        type: String,
        trim: true
    },
    message: {
        type: String,
        trim: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

// Index for admin dashboard queries
contactSchema.index({ created_at: -1 });

module.exports = mongoose.model('Contact', contactSchema);
