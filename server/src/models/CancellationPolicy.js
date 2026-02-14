const mongoose = require('mongoose');

const CancellationPolicySchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    rules: [{
        type: { type: String, enum: ['check', 'cross', 'info'], default: 'check' },
        text: { type: String, required: true }
    }],
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CancellationPolicy', CancellationPolicySchema);
