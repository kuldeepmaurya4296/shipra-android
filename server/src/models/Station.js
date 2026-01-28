const mongoose = require('mongoose');

const StationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    city: { type: String, required: true },
    country: { type: String, default: 'India' },
    active: { type: Boolean, default: true }
});

module.exports = mongoose.model('Station', StationSchema);
