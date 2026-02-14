const express = require('express');
const router = express.Router();
const CancellationPolicy = require('../models/CancellationPolicy');

// Get active cancellation policy
router.get('/', async (req, res) => {
    try {
        const policy = await CancellationPolicy.findOne({ isActive: true }).sort({ createdAt: -1 });
        if (!policy) {
            return res.status(404).json({ message: 'No active cancellation policy found' });
        }
        res.json(policy);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update or create policy (Admin only - simplification: public for now)
router.post('/', async (req, res) => {
    try {
        const { title, description, rules } = req.body;

        // Deactivate old policies
        await CancellationPolicy.updateMany({}, { isActive: false });

        const newPolicy = new CancellationPolicy({
            title,
            description,
            rules,
            isActive: true
        });

        await newPolicy.save();
        res.status(201).json(newPolicy);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
