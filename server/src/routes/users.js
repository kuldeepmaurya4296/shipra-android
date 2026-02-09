const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get current user profile
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
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

        const user = await User.findById(req.user.id);

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

        console.log('[Users API] Saving user with updated fields:', {
            id: user._id,
            name: user.name,
            whatsappNumber: user.whatsappNumber,
            phone: user.phone
        });

        await user.save();

        console.log('[Users API] User saved successfully');

        // Return updated user without password
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            whatsappNumber: user.whatsappNumber,
            callingNumber: user.callingNumber,
            aadharNumber: user.aadharNumber,
            panNumber: user.panNumber,
            currentAddress: user.currentAddress,
            permanentAddress: user.permanentAddress,
            otherDetails: user.otherDetails
        });
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
