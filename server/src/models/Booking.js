const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    birdNumber: { type: String, required: true },
    from: { type: String, defaultValue: 'Downtown Airport' },
    to: { type: String, required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'confirmed' },
    paymentId: { type: String },
    amount: { type: Number, required: true },
    birdId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bird' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Booking', BookingSchema);
