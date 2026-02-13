const mongoose = require('mongoose');

const VerbiportSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    city: { type: String, required: true },
    country: { type: String, default: 'India' },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    active: { type: Boolean, default: true }
});

module.exports = mongoose.model('Verbiport', VerbiportSchema);
