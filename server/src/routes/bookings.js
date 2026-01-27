const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

// Create Booking
router.post('/', auth, async (req, res) => {
    try {
        const newBooking = new Booking({
            ...req.body,
            userId: req.user.id
        });
        const booking = await newBooking.save();
        res.status(201).json(booking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get User Bookings
router.get('/', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
