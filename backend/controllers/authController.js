const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase');
const twilioClient = require('../config/twilio');

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

        // Check if user exists
        const userRef = db.collection('users').doc(phoneNumber);
        const userDoc = await userRef.get();
        console.log('User document exists:', userDoc.exists);

        if (!userDoc.exists) {
            console.log('Creating new user document');
            // Create new user
            await userRef.set({
                phoneNumber,
                createdAt: timestamp,
                signInCount: 1,
                lastSignIn: timestamp
            });
        } else {
            console.log('Updating existing user document');
            // Update existing user's sign-in count and last sign-in time
            await userRef.update({
                signInCount: (userDoc.data().signInCount || 0) + 1,
                lastSignIn: timestamp
            });
        }

        // Save OTP with timestamp
        console.log('Saving OTP to Firestore');
        await db.collection('otps').doc(phoneNumber).set({
            otp,
            timestamp,
            verified: false
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

        // Mark OTP as verified
        await otpRef.update({ verified: true });

        // Generate JWT token
        const token = jwt.sign(
            { phoneNumber },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'OTP verified successfully',
            token
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

module.exports = {
    signIn,
    verifyOTP,
    signOut
}; 