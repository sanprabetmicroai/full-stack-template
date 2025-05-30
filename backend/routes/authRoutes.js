const express = require('express');
const router = express.Router();
const { signIn, verifyOTP, signOut } = require('../controllers/authController');

router.post('/signin', signIn);
router.post('/verify', verifyOTP);
router.post('/signout', signOut);

module.exports = router;