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
        const { name } = req.body;
        const user = await User.findById(req.user.id);
        if (name) user.name = name;
        await user.save();
        res.json({ id: user._id, name: user.name, email: user.email });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
