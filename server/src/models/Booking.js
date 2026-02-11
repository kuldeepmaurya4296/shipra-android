const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    birdNumber: { type: String, required: true },
    from: { type: String, defaultValue: 'Downtown Airport' },
    to: { type: String, required: true },
    // GPS Coordinates for pickup & drop
    fromCoords: {
        latitude: { type: Number },
        longitude: { type: Number },
    },
    toCoords: {
        latitude: { type: Number },
        longitude: { type: Number },
    },
    date: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'ongoing', 'completed', 'cancelled'], default: 'confirmed' },
    paymentId: { type: String },
    amount: { type: Number, required: true },
    // Distance info
    distance: { type: Number }, // in km
    distanceType: { type: String, default: 'air_displacement' }, // always air_displacement for Bird
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
    // Book for someone else
    bookForOther: { type: Boolean, default: false },
    passengerName: { type: String },
    passengerPhone: { type: String },
    startTime: { type: Date },
    endTime: { type: Date },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Booking', BookingSchema);
