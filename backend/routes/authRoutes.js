const express = require('express');
const router = express.Router();
const { 
    sendOTP, 
    verifyOTPSignIn, 
    verifyOTPSignUp, 
    signOut,
    testEmailOTP,
    requestUpdateOTP,
    verifyUpdateOTP,
    checkResendStatus,
    testDatabaseConnection
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Test database connection route
router.get('/test-db', testDatabaseConnection);

// Test email OTP route
router.post('/test-email-otp', testEmailOTP);

// Send OTP for both sign-in and sign-up
router.post('/send-otp', sendOTP);

// Check resend status for OTP
router.post('/check-resend-status', checkResendStatus);

// Verify OTP for existing users (sign-in)
router.post('/verify-signin', verifyOTPSignIn);

// Verify OTP and create account for new users (sign-up)
router.post('/verify-signup', verifyOTPSignUp);

// Sign out
router.post('/signout', authenticateToken, signOut);

// Request OTP for updating email or phone
router.post('/request-update-otp', authenticateToken, requestUpdateOTP);
// Verify OTP and update email/phone
router.post('/verify-update-otp', authenticateToken, verifyUpdateOTP);

module.exports = router;