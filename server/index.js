const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load env from parent directory as requested by user to maintain single .env
dotenv.config({ path: path.join(__dirname, '../.env') });

const authRoutes = require('./src/routes/auth');
const bookingRoutes = require('./src/routes/bookings');
const userRoutes = require('./src/routes/users');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
console.log("mongodb uri: ", process.env.MONGODB_URI);
// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected Successfuly'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        console.log('\n--- TROUBLESHOOTING ---');
        console.log('1. Ensure your IP is whitelisted in MongoDB Atlas (Network Access).');
        console.log('2. Check if your database password in .env is correct.');
        console.log('3. If you are on a restricted network, try using a different connection string (non-SRV).');
        console.log('------------------------\n');
    });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
