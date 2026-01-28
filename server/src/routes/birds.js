const express = require('express');
const router = express.Router();
const Bird = require('../models/Bird');

// Get all birds
router.get('/', async (req, res) => {
    try {
        const birds = await Bird.find({ status: { $ne: 'maintenance' } });
        res.json(birds);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
