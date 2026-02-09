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
        console.log('User ID:', req.user.id);
        console.log('Amount:', req.body.amount);

        // Fetch user details first to check profile completeness
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get whatsapp number from request body or user profile
        const whatsappNumber = req.body.whatsappNumber || user.whatsappNumber;
        const userEmail = user.email;

        console.log('User Email:', userEmail || 'NOT SET');
        console.log('WhatsApp Number:', whatsappNumber || 'NOT SET');
        console.log('---------------------------');

        // Check if user has required contact info
        if (!userEmail && !whatsappNumber) {
            return res.status(400).json({
                message: 'Profile incomplete. Please add email or WhatsApp number to receive booking OTP.',
                profileIncomplete: true
            });
        }

        const newBooking = new Booking({
            ...req.body,
            userId: req.user.id,
            // Enhanced user details for pilot
            whatsappNumber: whatsappNumber,
            callingNumber: user.callingNumber || whatsappNumber,
            aadharNumber: user.aadharNumber,
            panNumber: user.panNumber,
            currentAddress: user.currentAddress,
            permanentAddress: user.permanentAddress,
            otherDetails: user.otherDetails
        });
        const booking = await newBooking.save();

        // Send OTP Notifications
        const message = `Your Shipra Booking (Ref: ${booking._id}) is confirmed! \nOTP: ${booking.otp} \nBird: ${booking.birdNumber}`;

        // Email
        if (userEmail) {
            console.log(`[OTP] Sending Email to: ${userEmail}`);
            sendEmail(userEmail, 'Booking Confirmed - Shipra', message);
        } else {
            console.log('[OTP] Skipping Email: No email available');
        }

        // WhatsApp (Use whatsappNumber from body or user profile, fallback to phone)
        const phoneForWhatsApp = whatsappNumber || req.body.phone || user.phone;
        if (phoneForWhatsApp) {
            console.log(`[OTP] Sending WhatsApp to: ${phoneForWhatsApp}`);
            sendWhatsApp(phoneForWhatsApp, message);
        } else {
            console.log('[OTP] Skipping WhatsApp: No phone number available');
        }

        res.status(201).json(booking);
    } catch (err) {
        console.error('Booking creation error:', err);
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
            .populate('userId', 'name email phone whatsappNumber callingNumber aadharNumber panNumber currentAddress permanentAddress otherDetails') // Fetch detailed user profile
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
