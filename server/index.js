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
const verbiportRoutes = require('./src/routes/vertiports');
const birdRoutes = require('./src/routes/birds');
const policyRoutes = require('./src/routes/policies');

const User = require('./src/models/User');
const Pilot = require('./src/models/Pilot');
const Bird = require('./src/models/Bird');
const Verbiport = require('./src/models/Vertiport');
const Booking = require('./src/models/Booking');
const CancellationPolicy = require('./src/models/CancellationPolicy');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/verbiports', verbiportRoutes);
app.use('/api/birds', birdRoutes);
app.use('/api/policies', policyRoutes);
console.log("mongodb uri: ", process.env.MONGODB_URI);
// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('✅ MongoDB Connected Successfuly');

        try {
            console.log('\n--- FETCHING ALL DB DATA ---');

            // const users = await User.find({});
            // console.log('\n--- USERS ---');
            // console.log(JSON.stringify(users, null, 2));

            // const pilots = await Pilot.find({});
            // console.log('\n--- PILOTS ---');
            // console.log(JSON.stringify(pilots, null, 2));

            // const birds = await Bird.find({});
            // console.log('\n--- BIRDS ---');
            // console.log(JSON.stringify(birds, null, 2));

            const verbiports = await Verbiport.find({});
            console.log('\n--- VERBIPORTS ---');
            console.log(JSON.stringify(verbiports, null, 2));

            // const bookings = await Booking.find({});
            // console.log('\n--- BOOKINGS ---');
            // console.log(JSON.stringify(bookings, null, 2));

            console.log('\n--- END OF DB DATA ---\n');
        } catch (e) {
            console.error('Error fetching initial data:', e);
        }
    })
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
