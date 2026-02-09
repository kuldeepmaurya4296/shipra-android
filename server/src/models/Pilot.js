const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const PilotSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    whatsappNumber: { type: String },
    callingNumber: { type: String },
    aadharNumber: {
        type: String,
        validate: {
            validator: function (v) {
                // Allow empty (optional field) or 12 digits
                return !v || /^\d{12}$/.test(v);
            },
            message: props => `${props.value} is not a valid 12-digit Aadhar number!`
        }
    },
    panNumber: {
        type: String,
        uppercase: true, // Auto-convert to uppercase
        validate: {
            validator: function (v) {
                // Allow empty or 10 characters length
                return !v || v.length === 10;
            },
            message: props => `PAN number must be exactly 10 characters!`
        }
    },
    currentAddress: { type: String },
    permanentAddress: { type: String },
    otherDetails: { type: String },
    role: { type: String, default: 'pilot' },
    createdAt: { type: Date, default: Date.now },
});

// Hash password before saving - only if password is modified
PilotSchema.pre('save', async function () {
    // Skip hashing if password hasn't been modified
    if (!this.isModified('password')) return;

    // Hash the password with bcrypt
    this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('Pilot', PilotSchema);
