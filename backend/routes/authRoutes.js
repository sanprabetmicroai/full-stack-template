const express = require('express');
const router = express.Router();
const { 
    sendOTP, 
    verifyOTPSignIn, 
    verifyOTPSignUp, 
    signOut 
} = require('../controllers/authController');

// Send OTP for both sign-in and sign-up
router.post('/send-otp', sendOTP);

// Verify OTP for existing users (sign-in)
router.post('/verify-signin', verifyOTPSignIn);

// Verify OTP and create account for new users (sign-up)
router.post('/verify-signup', verifyOTPSignUp);

// Sign out
router.post('/signout', signOut);

module.exports = router;