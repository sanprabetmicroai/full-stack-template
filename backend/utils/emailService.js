const sendgrid = require('../config/sendgrid');

/**
 * Send an email using SendGrid
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text content
 * @param {string} html - HTML content (optional)
 * @returns {Promise} - SendGrid response
 */
const sendEmail = async (to, subject, text, html = '') => {
    if (!sendgrid) {
        throw new Error('SendGrid is not configured');
    }

    const msg = {
        to,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject,
        text,
        html: html || text, // Use text as HTML if no HTML provided
    };

    try {
        const response = await sendgrid.send(msg);
        console.log('Email sent successfully:', response);
        return response;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = {
    sendEmail
}; 