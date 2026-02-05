const nodemailer = require('nodemailer');
const axios = require('axios');

// Email Transporter Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS?.replace(/"/g, '') // Remove quotes if they exist from env
    }
});

const sendEmail = async (to, subject, text) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('Skipping Email: EMAIL_USER or EMAIL_PASS not set.');
        return;
    }

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text
        });
        console.log(`[EMAIL] Sent to ${to}`);
    } catch (error) {
        console.error('[EMAIL] Failed:', error.message);
    }
};

const sendWhatsApp = async (to, body) => {
    const phoneNumberId = process.env.META_PHONE_NUMBER_ID?.replace(/"/g, '');
    const accessToken = process.env.META_ACCESS_TOKEN;

    if (!phoneNumberId || !accessToken) {
        console.warn('Skipping WhatsApp: Meta credentials not set.');
        return;
    }

    try {
        // Format phone number: Remove +, spaces, dashes
        // Meta requires country code. We assume input might have it or not.
        // For simplicity, strip non-digits. User's phone should be passed cleanly.
        let formattedTo = to.replace(/\D/g, '');

        // Ensure 10-15 digits. If 10, prepend 91 (default India).
        if (formattedTo.length === 10) {
            formattedTo = '91' + formattedTo;
        }

        const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

        await axios.post(url, {
            messaging_product: 'whatsapp',
            to: formattedTo,
            type: 'text',
            text: { body: body }
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`[WHATSAPP] Sent to ${formattedTo}`);
    } catch (error) {
        // Log detailed error from Meta if available
        const errorMsg = error.response?.data?.error?.message || error.message;
        console.error('[WHATSAPP] Failed:', errorMsg);
        if (error.response?.data) {
            console.error('[WHATSAPP] Details:', JSON.stringify(error.response.data));
        }
    }
};

module.exports = { sendEmail, sendWhatsApp };
