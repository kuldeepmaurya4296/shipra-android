const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const axios = require('axios');

// Environment Check
const requiredEnv = ['JWT_SECRET', 'META_PHONE_NUMBER_ID', 'META_ACCESS_TOKEN'];
const missingEnv = requiredEnv.filter(key => !process.env[key]);
if (missingEnv.length > 0) {
    console.error(`FATAL ERROR: Missing required environment variables: ${missingEnv.join(', ')}`);
    // Ideally exit, but for development we might just log
}

const JWT_SECRET = process.env.JWT_SECRET;

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

// OTP Request (WhatsApp Integration)
router.post('/otp-request', async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ message: 'Phone number is required' });

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP (expire in 5 mins)
        otpStore[phone] = {
            otp,
            expires: Date.now() + 5 * 60 * 1000
        };

        // Format phone number
        // 1. Remove non-digits
        let formattedPhone = phone.replace(/\D/g, '');
        // 2. Add default country code (91 for India) if missing (assuming 10 digits = local number)
        if (formattedPhone.length === 10) {
            formattedPhone = '91' + formattedPhone;
        }

        console.log(`Sending OTP ${otp} to ${formattedPhone}`);

        // Send via WhatsApp API
        const url = `https://graph.facebook.com/v18.0/${process.env.META_PHONE_NUMBER_ID}/messages`;

        try {
            await axios.post(url, {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: formattedPhone,
                type: "text",
                text: {
                    preview_url: false,
                    body: `Your Shipra App verification code is: ${otp}`
                }
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.META_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log(`OTP sent successfully to ${formattedPhone}`);
            res.json({ message: 'OTP sent successfully to WhatsApp', success: true });

        } catch (apiError) {
            console.error('WhatsApp API Error:', apiError.response?.data || apiError.message);

            // detailed error for the client to debug
            const metaError = apiError.response?.data?.error;
            let errorMessage = 'Failed to send WhatsApp message.';

            if (metaError) {
                if (metaError.code === 131030) {
                    errorMessage = `Number ${formattedPhone} is not a valid WhatsApp number (or not added to Test list for this App).`;
                } else if (metaError.type === 'OAuthException') {
                    errorMessage = `Authorization failed. Check META_ACCESS_TOKEN.`;
                } else {
                    errorMessage = `WhatsApp API Error: ${metaError.message}`;
                }
            }

            return res.status(500).json({
                message: errorMessage,
                details: metaError
            });
        }
    } catch (err) {
        console.error("Server Error:", err);
        res.status(500).json({ message: err.message });
    }
});

// OTP Verify
router.post('/otp-verify', async (req, res) => {
    try {
        const { phone, otp } = req.body;

        const storedData = otpStore[phone];

        if (!storedData) {
            return res.status(400).json({ message: 'OTP expired or not requested' });
        }

        if (storedData.expires < Date.now()) {
            delete otpStore[phone];
            return res.status(400).json({ message: 'OTP expired' });
        }

        if (storedData.otp !== otp) {
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
