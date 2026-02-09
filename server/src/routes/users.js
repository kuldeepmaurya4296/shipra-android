const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

const Pilot = require('../models/Pilot');

// Get current user profile
router.get('/me', auth, async (req, res) => {
    try {
        let user;
        if (req.user.role === 'pilot') {
            user = await Pilot.findById(req.user.id).select('-password');
        } else {
            user = await User.findById(req.user.id).select('-password');
        }

        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update profile
router.put('/me', auth, async (req, res) => {
    try {
        const {
            name,
            phone,
            whatsappNumber,
            callingNumber,
            aadharNumber,
            panNumber,
            currentAddress,
            permanentAddress,
            otherDetails
        } = req.body;

        let user;
        if (req.user.role === 'pilot') {
            user = await Pilot.findById(req.user.id);
        } else {
            user = await User.findById(req.user.id);
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update all provided fields
        if (name !== undefined) user.name = name;
        if (phone !== undefined) user.phone = phone;
        if (whatsappNumber !== undefined) user.whatsappNumber = whatsappNumber;
        if (callingNumber !== undefined) user.callingNumber = callingNumber;
        if (aadharNumber !== undefined) user.aadharNumber = aadharNumber;
        if (panNumber !== undefined) user.panNumber = panNumber;
        if (currentAddress !== undefined) user.currentAddress = currentAddress;
        if (permanentAddress !== undefined) user.permanentAddress = permanentAddress;
        if (otherDetails !== undefined) user.otherDetails = otherDetails;

        // Note: Email and Password are intentionally NOT updated here

        console.log('[Users API] Saving user/pilot with updated fields:', {
            id: user._id,
            name: user.name,
            whatsappNumber: user.whatsappNumber,
            phone: user.phone,
            role: req.user.role
        });

        await user.save();

        console.log('[Users API] Saved successfully');

        // Return updated user without password
        const userObj = user.toObject();
        delete userObj.password;
        res.json(userObj);
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
