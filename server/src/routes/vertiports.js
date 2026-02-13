const express = require('express');
const router = express.Router();
const Verbiport = require('../models/Vertiport');

// Get all verbiports
router.get('/', async (req, res) => {
    try {
        const verbiports = await Verbiport.find({ active: true });
        res.json(verbiports);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
