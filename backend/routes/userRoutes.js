const express = require('express');
const router = express.Router();
const { getUserInfo, updateUserInfo, updateProfileImage } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Apply authentication middleware to all user routes
router.use(authenticateToken);

// Update profile image (more specific route)
router.put('/:uid/profile-image', updateProfileImage);

// Get user information
router.get('/:uid', getUserInfo);

// Update user information
router.put('/:uid', updateUserInfo);

module.exports = router; 