const { db } = require('../config/firebase');

// Get user information
const getUserInfo = async (req, res) => {
    console.log('=== User Info Request ===');
    console.log('Request params:', req.params);
    console.log('Auth user:', req.user);
    console.log('Headers:', req.headers);
    
    try {
        const { uid } = req.params;
        
        if (!uid) {
            console.log('Error: Missing user ID');
            return res.status(400).json({ 
                success: false,
                message: 'User ID is required' 
            });
        }

        // Check if the requesting user is trying to access their own data
        if (req.user.userId !== uid) {
            console.log('Authorization error:', {
                requestedUid: uid,
                authenticatedUid: req.user.userId
            });
            return res.status(403).json({ 
                success: false,
                message: 'You are not authorized to access this user\'s information' 
            });
        }

        console.log('Fetching user from database:', uid);
        const user = await db.collection('users').doc(uid).get();

        if (!user.exists) {
            console.log('User not found in database:', uid);
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        const userData = {
            id: user.id,
            ...user.data()
        };
        
        console.log('Successfully retrieved user data:', {
            id: userData.id,
            hasData: !!userData
        });

        res.json({
            success: true,
            data: userData
        });
    } catch (error) {
        console.error('Error fetching user info:', {
            error: error.message,
            stack: error.stack,
            uid: req.params.uid
        });
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch user information',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update user information
const updateUserInfo = async (req, res) => {
    try {
        const { uid } = req.params;
        const updateData = req.body;

        if (!uid) {
            return res.status(400).json({ 
                success: false,
                message: 'User ID is required' 
            });
        }

        // Check if the requesting user is trying to update their own data
        if (req.user.userId !== uid) {
            return res.status(403).json({ 
                success: false,
                message: 'You are not authorized to update this user\'s information' 
            });
        }

        // Remove sensitive fields that shouldn't be updated directly
        delete updateData.id;
        delete updateData.phoneNumber; // Phone number should be updated through auth flow
        delete updateData.createdAt;

        await db.collection('users').doc(uid).update({
            ...updateData,
            updatedAt: new Date()
        });

        // Get updated user data
        const updatedUser = await db.collection('users').doc(uid).get();

        res.json({
            success: true,
            message: 'User information updated successfully',
            data: {
                id: updatedUser.id,
                ...updatedUser.data()
            }
        });
    } catch (error) {
        console.error('Error updating user info:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to update user information' 
        });
    }
};

// Update user profile image
const updateProfileImage = async (req, res) => {
    try {
        const { uid } = req.params;
        const { imageUrl } = req.body;

        if (!uid) {
            return res.status(400).json({ 
                success: false,
                message: 'User ID is required' 
            });
        }

        if (!imageUrl) {
            return res.status(400).json({ 
                success: false,
                message: 'Image URL is required' 
            });
        }

        // Check if the requesting user is trying to update their own data
        if (req.user.userId !== uid) {
            return res.status(403).json({ 
                success: false,
                message: 'You are not authorized to update this user\'s information' 
            });
        }

        await db.collection('users').doc(uid).update({
            profileImage: imageUrl,
            updatedAt: new Date()
        });

        // Get updated user data
        const updatedUser = await db.collection('users').doc(uid).get();

        res.json({
            success: true,
            message: 'Profile image updated successfully',
            data: {
                id: updatedUser.id,
                ...updatedUser.data()
            }
        });
    } catch (error) {
        console.error('Error updating profile image:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to update profile image' 
        });
    }
};

module.exports = {
    getUserInfo,
    updateUserInfo,
    updateProfileImage
}; 