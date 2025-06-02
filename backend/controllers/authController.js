const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase');
const twilioClient = require('../config/twilio');
const { v4: uuidv4 } = require('uuid');

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTP = async (phoneNumber, otp) => {
    try {
        console.log('Attempting to send OTP via Twilio:', { phoneNumber, otp });
        const message = await twilioClient.messages.create({
            body: `Your OTP is: ${otp}. Valid for 5 minutes.`,
            to: phoneNumber,
            from: process.env.TWILIO_PHONE_NUMBER
        });
        console.log('Twilio message sent successfully:', { messageSid: message.sid });
        return true;
    } catch (error) {
        console.error('Error sending OTP via Twilio:', {
            error: error.message,
            code: error.code,
            status: error.status,
            details: error.moreInfo
        });
        return false;
    }
};

const signIn = async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        console.log('Received sign in request for phone number:', phoneNumber);
    
        if (!phoneNumber) {
            console.error('Phone number missing in request');
            return res.status(400).json({ error: 'Phone number is required' });
        }

        // Generate OTP
        const otp = generateOTP();
        const timestamp = new Date();
        console.log('Generated OTP:', { otp, timestamp });

        // Check if user exists by phone number
        const usersRef = db.collection('users');
        const userQuery = await usersRef.where('phoneNumber', '==', phoneNumber).get();
        console.log('User query result:', userQuery.empty ? 'No user found' : 'User found');

        if (userQuery.empty) {
            console.log('Creating new user document');
            // Create new user with UUID
            const userId = uuidv4();
            await usersRef.doc(userId).set({
                id: userId,
                phoneNumber,
                createdAt: timestamp,
                signInCount: 1,
                lastSignIn: timestamp
            });
        } else {
            console.log('Updating existing user document');
            const userDoc = userQuery.docs[0];
            // Update existing user's sign-in count and last sign-in time
            await userDoc.ref.update({
                signInCount: (userDoc.data().signInCount || 0) + 1,
                lastSignIn: timestamp
            });
        }

        // Save OTP with timestamp
        console.log('Saving OTP to Firestore');
        const ttlTimestamp = new Date();
        ttlTimestamp.setMinutes(ttlTimestamp.getMinutes() + 5); // 5 minutes TTL
        
        await db.collection('otps').doc(phoneNumber).set({
            otp,
            timestamp,
            ttl: ttlTimestamp
        });

        // Send OTP via Twilio
        console.log('Initiating OTP send via Twilio');
        const otpSent = await sendOTP(phoneNumber, otp);
    
        if (!otpSent) {
            console.error('Failed to send OTP via Twilio');
            return res.status(500).json({ error: 'Failed to send OTP' });
        }

        console.log('OTP process completed successfully');
        res.status(200).json({ 
            message: 'OTP sent successfully',
            phoneNumber 
        });

    } catch (error) {
        console.error('Error in signIn controller:', {
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        res.status(500).json({ error: 'Internal server error' });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;
        console.log('Verifying OTP for:', { phoneNumber, otp });

        if (!phoneNumber || !otp) {
            return res.status(400).json({ error: 'Phone number and OTP are required' });
        }

        // Get OTP from Firestore
        const otpRef = db.collection('otps').doc(phoneNumber);
        const otpDoc = await otpRef.get();

        if (!otpDoc.exists) {
            console.log('OTP document not found for phone number:', phoneNumber);
            return res.status(400).json({ error: 'OTP not found' });
        }

        const otpData = otpDoc.data();
        console.log('Retrieved OTP data:', { 
            storedOTP: otpData.otp,
            timestamp: otpData.timestamp,
            verified: otpData.verified 
        });

        const otpTimestamp = otpData.timestamp.toDate();
        const currentTime = new Date();
        const timeDiff = (currentTime - otpTimestamp) / 1000 / 60; // difference in minutes

        // Check if OTP is expired (5 minutes)
        if (timeDiff > 5) {
            console.log('OTP expired. Time difference:', timeDiff, 'minutes');
            return res.status(400).json({ error: 'OTP expired' });
        }

        // Verify OTP
        if (otpData.otp !== otp) {
            console.log('Invalid OTP. Received:', otp, 'Expected:', otpData.otp);
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // Delete OTP document after successful verification
        await otpRef.delete();
        console.log('OTP document deleted after successful verification');

        // Get user data
        const usersRef = db.collection('users');
        const userQuery = await usersRef.where('phoneNumber', '==', phoneNumber).get();
        const userDoc = userQuery.docs[0];
        const userData = userDoc.data();

        // Check if user profile is complete
        const isProfileComplete = userData.firstName && 
                                userData.lastName && 
                                userData.email && 
                                userData.phoneNumber;

        if (!isProfileComplete) {
            return res.status(200).json({
                message: 'OTP verified successfully',
                profileComplete: false,
                user: {
                    id: userData.id,
                    phoneNumber: userData.phoneNumber,
                    firstName: userData.firstName || '',
                    lastName: userData.lastName || '',
                    email: userData.email || ''
                }
            });
        }

        // Generate JWT token with user ID
        const token = jwt.sign(
            { 
                userId: userData.id,
                phoneNumber: userData.phoneNumber 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'OTP verified successfully',
            profileComplete: true,
            token,
            user: {
                id: userData.id,
                phoneNumber: userData.phoneNumber,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email
            }
        });

    } catch (error) {
        console.error('Detailed error in verifyOTP:', {
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
};

const signOut = async (req, res) => {
    try {
    // Since we're using JWT, we don't need to do anything on the server side
    // The client should remove the token from their storage
        res.status(200).json({ message: 'Signed out successfully' });
    } catch (error) {
        console.error('Error in signOut:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const signUp = async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNumber, name } = req.body;
        console.log('Received sign up request:', { firstName, lastName, email, phoneNumber, name });

        if (!firstName || !lastName || !email || !phoneNumber) {
            console.error('Missing required fields in sign up request');
            return res.status(400).json({ error: 'First name, last name, email, and phone number are required' });
        }

        // Check if user already exists by phone number
        const usersRef = db.collection('users');
        const userQuery = await usersRef.where('phoneNumber', '==', phoneNumber).get();

        if (!userQuery.empty) {
            console.log('User already exists with phone number:', phoneNumber);
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create new user with UUID
        const userId = uuidv4();
        const timestamp = new Date();
        
        await usersRef.doc(userId).set({
            id: userId,
            firstName,
            lastName,
            name,
            email,
            phoneNumber,
            createdAt: timestamp,
            signInCount: 0,
            lastSignIn: null
        });

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: userId,
                firstName,
                lastName,
                name,
                email,
                phoneNumber
            }
        });

    } catch (error) {
        console.error('Error in signUp:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const completeProfile = async (req, res) => {
    try {
        const { id, firstName, lastName, email } = req.body;
        console.log('Completing profile for user:', { id, firstName, lastName, email });

        if (!id || !firstName || !lastName || !email) {
            console.error('Missing required fields in profile completion request');
            return res.status(400).json({ error: 'First name, last name, and email are required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Get user data
        const userRef = db.collection('users').doc(id);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            console.error('User not found:', id);
            return res.status(404).json({ error: 'User not found' });
        }

        // Update user profile
        await userRef.update({
            firstName,
            lastName,
            email,
            updatedAt: new Date()
        });

        // Generate new JWT token
        const token = jwt.sign(
            { 
                userId: id,
                phoneNumber: userDoc.data().phoneNumber 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Profile completed successfully',
            token,
            user: {
                id,
                firstName,
                lastName,
                email,
                phoneNumber: userDoc.data().phoneNumber
            }
        });

    } catch (error) {
        console.error('Error in completeProfile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    signIn,
    verifyOTP,
    signOut,
    signUp,
    completeProfile
}; 