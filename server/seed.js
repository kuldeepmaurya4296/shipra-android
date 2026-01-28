const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Models
const Station = require('./src/models/Station');
const Bird = require('./src/models/Bird');
const User = require('./src/models/User');
const Booking = require('./src/models/Booking');

// Config
dotenv.config({ path: path.join(__dirname, '../.env') });

const stations = [
    { name: 'Downtown Skyport', code: 'DTN', city: 'Metropolis', country: 'India', location: { lat: 28.6139, lng: 77.2090 } }, // New Delhi
    { name: 'Tech Hub Vertiport', code: 'TECH', city: 'Metropolis', country: 'India', location: { lat: 28.4595, lng: 77.0266 } }, // Gurgaon
    { name: 'Coastal Bay Deck', code: 'BAY', city: 'Metropolis', country: 'India', location: { lat: 28.5355, lng: 77.3910 } }, // Noida
    { name: 'Highland Terminal', code: 'HIGH', city: 'Metropolis', country: 'India', location: { lat: 28.7041, lng: 77.1025 } }, // North Delhi
    { name: 'Central Station', code: 'CEN', city: 'Metropolis', country: 'India', location: { lat: 28.6448, lng: 77.2167 } } // Central Delhi
];

const birds = [
    { name: 'SkyGlider X1', model: 'eVTOL-X1', capacity: 4, range: '400km', status: 'active', location: { lat: 28.6200, lng: 77.2100 } },
    { name: 'UrbanHawk 5', model: 'eVTOL-UH5', capacity: 6, range: '600km', status: 'active', location: { lat: 28.4600, lng: 77.0300 } },
    { name: 'Falcon Electric', model: 'eVTOL-FE', capacity: 4, range: '550km', status: 'active', location: { lat: 28.5400, lng: 77.3950 } },
    { name: 'VoloCity Air', model: 'VC-200', capacity: 2, range: '300km', status: 'maintenance', location: { lat: 28.6500, lng: 77.2200 } }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data (optional, be careful in production!)
        console.log('🧹 Clearing existing data...');
        await Station.deleteMany({});
        await Bird.deleteMany({});
        // await User.deleteMany({}); // Keeping users intact for now
        // await Booking.deleteMany({}); // Keeping bookings intact 

        // Seed Stations
        console.log('🏗 Seeding Stations...');
        await Station.insertMany(stations);

        // Seed Birds
        console.log('🦅 Seeding Birds...');
        await Bird.insertMany(birds);

        // Check if admin user exists, else create
        const adminEmail = 'admin@shipra.com';
        let adminUser = await User.findOne({ email: adminEmail });
        if (!adminUser) {
            console.log('👤 Creating Test Admin User...');
            adminUser = new User({
                name: 'Shipra Admin',
                email: adminEmail,
                password: 'password123' // Will be hashed by pre-save hook
            });
            await adminUser.save();
        }

        console.log('✅ Seeding Complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding Error:', err);
        process.exit(1);
    }
};

seedDB();
