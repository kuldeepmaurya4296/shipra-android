const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const User = require('../models/User');
const { sendEmail, sendWhatsApp } = require('../services/notificationService');
const auth = require('../middleware/auth');

// Create Booking
router.post('/', auth, async (req, res) => {
    try {
        console.log('--- NEW BOOKING REQUEST ---');
        console.log('OTP Generated:', req.body.otp || 'N/A');
        console.log('User:', req.user.id);
        console.log('Amount:', req.body.amount);
        console.log('---------------------------');

        const newBooking = new Booking({
            ...req.body,
            userId: req.user.id
        });
        const booking = await newBooking.save();

        // Send Industry Level Notifications
        const user = await User.findById(req.user.id);
        if (user) {
            const message = `Your Shipra Booking (Ref: ${booking._id}) is confirmed! \nOTP: ${booking.otp} \nBird: ${booking.birdNumber}`;

            // Email
            if (user.email) {
                // Async no-wait to not block response
                sendEmail(user.email, 'Booking Confirmed - Shipra', message);
            }

            // WhatsApp (Use phone from body or user profile)
            const phone = req.body.phone || user.phone;
            if (phone) {
                sendWhatsApp(phone, message);
            } else {
                console.log('No phone number available for WhatsApp');
            }
        }

        res.status(201).json(booking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Verify OTP (Pilot)
router.post('/verify-otp', async (req, res) => {
    try {
        const { otp } = req.body;
        if (!otp) return res.status(400).json({ message: 'OTP is required' });

        // Find booking with this OTP
        // In a real app, you might want additional filters (e.g. status='confirmed')
        const booking = await Booking.findOne({ otp })
            .populate('userId', 'name email phone') // Fetch user details
            .populate('birdId', 'name model');      // Fetch bird details

        if (!booking) {
            return res.status(404).json({ message: 'Invalid OTP or Booking not found' });
        }

        res.json(booking);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
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
