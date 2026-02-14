const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const User = require('../models/User');
const Pilot = require('../models/Pilot');
const Bird = require('../models/Bird'); // Assuming Bird model exists
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

        // Auto-assign to Captain Kuldeep for now (Single Pilot restriction)
        let assignedPilotId = undefined;
        try {
            const defaultPilot = await Pilot.findOne({ email: 'k6263638053@gmail.com' });
            if (defaultPilot) {
                assignedPilotId = defaultPilot._id;
                console.log(`Auto-assigning booking to pilot: ${defaultPilot.name} (${assignedPilotId})`);
            }
        } catch (pilotErr) {
            console.error("Error finding default pilot:", pilotErr);
        }

        const newBooking = new Booking({
            ...req.body,
            userId: req.user.id,
            pilotId: assignedPilotId,
            status: 'confirmed', // Explicitly set status
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
            try {
                await sendEmail(userEmail, 'Booking Confirmed - Shipra', message);
            } catch (e) {
                console.error("Email send failed", e);
            }
        } else {
            console.log('[OTP] Skipping Email: No email available');
        }

        // WhatsApp (Use whatsappNumber from body or user profile, fallback to phone)
        const phoneForWhatsApp = whatsappNumber || req.body.phone || user.phone;
        if (phoneForWhatsApp) {
            console.log(`[OTP] Sending WhatsApp to: ${phoneForWhatsApp}`);
            try {
                await sendWhatsApp(phoneForWhatsApp, message);
            } catch (e) {
                console.error("WhatsApp send failed", e);
            }
        } else {
            console.log('[OTP] Skipping WhatsApp: No phone number available');
        }

        res.status(201).json(booking);
    } catch (err) {
        console.error('Booking creation error:', err);
        res.status(500).json({ message: err.message });
    }
});

// Verify OTP (Pilot) - Requires Auth to track which pilot verified it
router.post('/verify-otp', auth, async (req, res) => {
    try {
        const { otp } = req.body;
        if (!otp) return res.status(400).json({ message: 'OTP is required' });

        // Find booking with this OTP
        const booking = await Booking.findOne({ otp })
            .populate('userId', 'name email phone whatsappNumber callingNumber aadharNumber panNumber currentAddress permanentAddress otherDetails')
            .populate('birdId', 'name model');

        if (!booking) {
            return res.status(404).json({ message: 'Invalid OTP or Booking not found' });
        }

        // Update Booking Status
        booking.status = 'ongoing';
        booking.startTime = new Date(); // Track ride start time
        booking.pilotId = req.user.id; // Confirm the pilot who verified it is effectively the pilot
        booking.otp = undefined; // Clear OTP so it can't be used again
        await booking.save();

        // Update Pilot Status to 'busy'
        await Pilot.findByIdAndUpdate(req.user.id, { status: 'busy' });

        // Update Bird Status to 'in-air'
        if (booking.birdId) {
            await Bird.findByIdAndUpdate(booking.birdId, { status: 'in-air' });
        }

        res.json(booking);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Update Ride Status (For Pilot to complete/cancel/etc)
router.post('/update-status', auth, async (req, res) => {
    try {
        const { bookingId, status } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // Ensure pilot owns this booking
        if (booking.pilotId && booking.pilotId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized for this booking' });
        }

        booking.status = status;

        if (status === 'completed') {
            booking.endTime = new Date(); // Track ride end time

            // Release Pilot
            await Pilot.findByIdAndUpdate(req.user.id, { status: 'active' });

            // Release Bird
            if (booking.birdId) {
                await Bird.findByIdAndUpdate(booking.birdId, { status: 'active' });
            }
        }

        await booking.save();
        res.json(booking);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// Get Pilot Ride History
router.get('/pilot-history', auth, async (req, res) => {
    try {
        // Find bookings assigned to this pilot
        const bookings = await Booking.find({ pilotId: req.user.id })
            .populate('userId', 'name email phone whatsappNumber callingNumber aadharNumber panNumber currentAddress permanentAddress otherDetails')
            .populate('birdId', 'name model')
            .sort({ createdAt: -1 }); // Newest first

        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get User Bookings
router.get('/', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user.id })
            .populate('birdId', 'name model')
            .populate('pilotId', 'name phone') // Populate pilot info
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Single Booking by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('birdId', 'name model')
            .populate('pilotId', 'name phone')
            .populate('userId', 'name email phone');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update Booking (User or Pilot)
router.patch('/:id', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        console.log(`[Booking Patch] ID: ${req.params.id}, User: ${req.user.id}, New Status: ${req.body.status}`);

        // Authorization: User who booked OR Assigned Pilot
        const isOwner = booking.userId && booking.userId.toString() === req.user.id;
        const isPilot = booking.pilotId && booking.pilotId.toString() === req.user.id;

        if (!isOwner && !isPilot) {
            console.log('[Booking Patch] Auth Failed', { isOwner, isPilot });
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { status } = req.body;
        if (status) {
            booking.status = status;

            // Handle cancellations or completions to free up resources
            if (status === 'cancelled' || status === 'completed') {
                // Free Pilot
                if (booking.pilotId) {
                    await Pilot.findByIdAndUpdate(booking.pilotId, { status: 'active' });
                }
                // Free Bird
                if (booking.birdId) {
                    await Bird.findByIdAndUpdate(booking.birdId, { status: 'active' });
                }
            }
        }

        // Apply other updates if provided
        if (req.body.otp !== undefined) booking.otp = req.body.otp;

        await booking.save();
        console.log('[Booking Patch] Success');
        res.json(booking);
    } catch (err) {
        console.error('[Booking Patch] Error:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

