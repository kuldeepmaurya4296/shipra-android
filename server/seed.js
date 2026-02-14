const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Models
const Verbiport = require('./src/models/Vertiport');
const Bird = require('./src/models/Bird');
const User = require('./src/models/User');
const Booking = require('./src/models/Booking');
const CancellationPolicy = require('./src/models/CancellationPolicy');

// Config
dotenv.config({ path: path.join(__dirname, '../.env') });

const verbiports = [
    { name: 'Bhopal Central', code: 'BHO', city: 'Bhopal', country: 'India', location: { lat: 23.2599, lng: 77.4126 } },
    { name: 'Indore Junction', code: 'IDR', city: 'Indore', country: 'India', location: { lat: 22.7196, lng: 75.8577 } },
    { name: 'Ujjain Mahakal', code: 'UJJ', city: 'Ujjain', country: 'India', location: { lat: 23.1765, lng: 75.7885 } },
    { name: 'Rewa City', code: 'REW', city: 'Rewa', country: 'India', location: { lat: 24.5362, lng: 81.3037 } },
    { name: 'Satna Main', code: 'STA', city: 'Satna', country: 'India', location: { lat: 24.6005, lng: 80.8322 } },
    { name: 'Vidisha Town', code: 'BHS', city: 'Vidisha', country: 'India', location: { lat: 23.5256, lng: 77.8081 } },
    { name: 'Sehore Verbiport', code: 'SEH', city: 'Sehore', country: 'India', location: { lat: 23.2030, lng: 77.0844 } },
    { name: 'Hoshangabad Ghat', code: 'HBD', city: 'Narmadapuram', country: 'India', location: { lat: 22.7516, lng: 77.7294 } },
    { name: 'Delhi Terminal 3', code: 'DEL', city: 'Delhi', country: 'India', location: { lat: 28.5562, lng: 77.1000 } },
    { name: 'Mumbai International', code: 'BOM', city: 'Mumbai', country: 'India', location: { lat: 19.0896, lng: 72.8656 } },
    { name: 'Bangalore Tech Park', code: 'BLR', city: 'Bangalore', country: 'India', location: { lat: 13.1986, lng: 77.7066 } },
    { name: 'Hyderabad Central', code: 'HYD', city: 'Hyderabad', country: 'India', location: { lat: 17.2403, lng: 78.4294 } },
    { name: 'Chennai Port', code: 'MAA', city: 'Chennai', country: 'India', location: { lat: 12.9941, lng: 80.1709 } },
    { name: 'Kolkata City', code: 'CCU', city: 'Kolkata', country: 'India', location: { lat: 22.6420, lng: 88.4467 } },
    { name: 'Pune West', code: 'PNQ', city: 'Pune', country: 'India', location: { lat: 18.5820, lng: 73.9197 } },
    { name: 'Ahmedabad North', code: 'AMD', city: 'Ahmedabad', country: 'India', location: { lat: 23.0734, lng: 72.6347 } },
    { name: 'Jaipur Pink City', code: 'JAI', city: 'Jaipur', country: 'India', location: { lat: 26.8242, lng: 75.8122 } },
    { name: 'Lucknow Metro', code: 'LKO', city: 'Lucknow', country: 'India', location: { lat: 26.7606, lng: 80.8893 } }
];

const policy = {
    title: 'Cancellation & Refund Policy',
    description: 'At Shipra Air Mobility, we provide a structured refund system to balance user experience and operational efficiency. Each flight slot involves precise scheduling of eVTOL birds and verbiport windows.',
    rules: [
        { type: 'check', text: 'Full refund for cancellations made within 1 minute of booking.' },
        { type: 'check', text: '50% cancellation fee applies if cancelled once user starts moving towards verbiport.' },
        { type: 'cross', text: 'No refund if cancelled after arriving at the verbiport or after the scheduled takeoff time.' },
        { type: 'check', text: 'Refunds will be processed back to your original payment method within 5-7 business days.' },
        { type: 'info', text: 'Health & Safety: Cancellations due to medical emergencies require a valid certificate for full credit refund.' },
        { type: 'info', text: 'Weather Policy: If Shipra cancels a flight due to adverse weather, you get a 100% refund or free rescheduling.' },
        { type: 'check', text: 'Security Protocol: All cancellations are logged for security and slot management.' },
        { type: 'check', text: 'Subscription Bonus: Shipra Plus members get 1 monthly free cancellation regardless of timing (before takeoff).' }
    ]
};

const birds = [
    { name: 'pushpako2 x1', model: 'eVTOL-P2X1', capacity: 4, range: '400km', status: 'active', location: { lat: 23.2650, lng: 77.4150 } }, // Near Bhopal
    { name: 'pushpako2 x2', model: 'eVTOL-P2X2', capacity: 6, range: '600km', status: 'active', location: { lat: 23.2550, lng: 77.4100 } }, // Near Bhopal
    { name: 'pushpako2 x3', model: 'eVTOL-P2X3', capacity: 4, range: '550km', status: 'active', location: { lat: 23.2600, lng: 77.4200 } }, // Near Bhopal
    { name: 'pushpako2 x4', model: 'eVTOL-P2X4', capacity: 2, range: '300km', status: 'active', location: { lat: 23.2500, lng: 77.4050 } }, // Near Bhopal
    { name: 'pushpako2 x5', model: 'eVTOL-P2X5', capacity: 4, range: '450km', status: 'active', location: { lat: 23.2580, lng: 77.4080 } }, // Near Bhopal
    { name: 'pushpako2 x6', model: 'eVTOL-P2X6', capacity: 5, range: '480km', status: 'active', location: { lat: 23.2520, lng: 77.4120 } }, // Near Bhopal
    { name: 'pushpako2 x7', model: 'eVTOL-P2X7', capacity: 3, range: '350km', status: 'active', location: { lat: 23.2620, lng: 77.4180 } }, // Near Bhopal
    { name: 'pushpako2 x8', model: 'eVTOL-P2X8', capacity: 4, range: '420km', status: 'active', location: { lat: 23.2480, lng: 77.4020 } }  // Near Bhopal
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data (optional, be careful in production!)
        console.log('🧹 Clearing existing data...');
        await Verbiport.deleteMany({});
        await Bird.deleteMany({});
        await CancellationPolicy.deleteMany({});
        // await User.deleteMany({}); // Keeping users intact for now
        // await Booking.deleteMany({}); // Keeping bookings intact 

        // Seed Verbiports
        console.log('🏗 Seeding Verbiports...');
        await Verbiport.insertMany(verbiports);

        // Seed Birds
        console.log('🦅 Seeding Birds...');
        await Bird.insertMany(birds);

        // Seed Policy
        console.log('📑 Seeding Cancellation Policy...');
        await new CancellationPolicy(policy).save();

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
