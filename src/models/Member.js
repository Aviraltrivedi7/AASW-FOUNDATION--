const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
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
    payment_id: {
        type: String,
        unique: true,
        sparse: true  // Allows multiple nulls (for pending members without payment)
    },
    planId: {
        type: String
    },
    status: {
        type: String,
        default: 'Pending Verification'
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

// Index for common queries
memberSchema.index({ email: 1 });
memberSchema.index({ created_at: -1 });

module.exports = mongoose.model('Member', memberSchema);
