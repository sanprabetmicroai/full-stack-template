const twilio = require('twilio');
require('dotenv').config();

let client = null;

try {
    console.log('Initializing Twilio client...');
    console.log('Environment variables:', {
        hasAccountSid: !!process.env.TWILIO_ACCOUNT_SID,
        hasAuthToken: !!process.env.TWILIO_AUTH_TOKEN,
        hasPhoneNumber: !!process.env.TWILIO_PHONE_NUMBER
    });

    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
        console.log('Twilio client initialized successfully');
    } else {
        console.log('Twilio credentials not provided, SMS functionality will be disabled');
    }
} catch (error) {
    console.error('Error initializing Twilio client:', error);
    // Don't throw error here, let the app start even if Twilio fails
}

module.exports = client;