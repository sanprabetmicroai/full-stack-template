const express = require('express');
const router = express.Router();
const { signIn, verifyOTP, signOut, signUp, completeProfile } = require('../controllers/authController');

router.post('/signin', signIn);
router.post('/verify', verifyOTP);
router.post('/signout', signOut);
router.post('/signup', signUp);
router.post('/complete-profile', completeProfile);

module.exports = router;