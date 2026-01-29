const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined.");
    process.exit(1);
}

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        user = new User({ name, email, password });
        await user.save();

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: user._id, name, email } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, name: user.name, email } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Social Login (Mock/Simplified)
router.post('/social-login', async (req, res) => {
    try {
        const { email, name, provider } = req.body;

        let user = await User.findOne({ email });

        if (!user) {
            // Create new user if not exists (using random password)
            const randomPassword = Math.random().toString(36).slice(-8);
            user = new User({
                name: name || email.split('@')[0],
                email,
                password: randomPassword,
                provider // Store provider if schema allows, otherwise ignore
            });
            await user.save();
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// In-memory OTP store (for demo purposes)
const otpStore = {};

// OTP Request (Mock for WhatsApp)
router.post('/otp-request', async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ message: 'Phone number is required' });

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP (expire in 5 mins ideally, but simple for now)
        otpStore[phone] = otp;

        console.log(` OTP for ${phone}: ${otp}`); // Log for demo use

        res.json({ message: 'OTP sent successfully to WhatsApp', success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// OTP Verify
router.post('/otp-verify', async (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (otpStore[phone] !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Clear OTP
        delete otpStore[phone];

        // Find or create user
        let user = await User.findOne({ email: `${phone}@whatsapp.user` }); // Pseudo-email for phone users

        if (!user) {
            user = new User({
                name: `User ${phone.slice(-4)}`,
                email: `${phone}@whatsapp.user`,
                password: Math.random().toString(36),
                provider: 'whatsapp',
                phone: phone
            });
            await user.save();
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
