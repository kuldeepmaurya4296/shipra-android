const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    birdNumber: { type: String, required: true },
    from: { type: String, defaultValue: 'Downtown Airport' },
    to: { type: String, required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'ongoing', 'completed', 'cancelled'], default: 'confirmed' },
    paymentId: { type: String },
    amount: { type: Number, required: true },
    birdId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bird' },
    pilotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pilot' }, // Pilot assigned to this booking
    otp: { type: String },
    phone: { type: String },
    whatsappNumber: { type: String },
    callingNumber: { type: String },
    aadharNumber: { type: String },
    panNumber: { type: String },
    currentAddress: { type: String },
    permanentAddress: { type: String },
    otherDetails: { type: String },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Booking', BookingSchema);
