const mongoose = require('mongoose');

const BirdSchema = new mongoose.Schema({
    name: { type: String, required: true },
    model: { type: String, required: true },
    capacity: { type: Number, default: 4 },
    range: { type: String, default: '500km' },
    location: {
        lat: { type: Number, default: 28.7041 },
        lng: { type: Number, default: 77.1025 }
    },
    status: { type: String, enum: ['active', 'maintenance', 'flight'], default: 'active' },
    imageUrl: { type: String }
});

module.exports = mongoose.model('Bird', BirdSchema);
