const sgMail = require('@sendgrid/mail');
require('dotenv').config();

let client = null;

try {
    console.log('Initializing SendGrid client...');
    console.log('Environment variables:', {
        hasApiKey: !!process.env.SENDGRID_API_KEY,
        hasFromEmail: !!process.env.SENDGRID_FROM_EMAIL
    });

    if (process.env.SENDGRID_API_KEY) {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        client = sgMail;
        console.log('SendGrid client initialized successfully');
    } else {
        console.log('SendGrid API key not provided, email functionality will be disabled');
    }
} catch (error) {
    console.error('Error initializing SendGrid client:', error);
    // Don't throw error here, let the app start even if SendGrid fails
}

module.exports = client; 