const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase');
const twilioClient = require('../config/twilio');
const { v4: uuidv4 } = require('uuid');


const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const isValidPhoneNumber = (phoneNumber) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
};

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const sendSMS = async (phoneNumber, otp) => {
    try {
        console.log('Sending OTP via Twilio:', { phoneNumber, otp });
        console.log('Twilio client status:', {
            isNull: twilioClient === null,
            hasMessages: twilioClient?.messages !== undefined,
            hasCreate: twilioClient?.messages?.create !== undefined
        });
        
        if (!twilioClient) {
            throw new Error('Twilio client is not initialized');
        }

        const message = await twilioClient.messages.create({
            body: `Your verification code is: ${otp}. Valid for 5 minutes.`,
            to: phoneNumber,
            from: process.env.TWILIO_PHONE_NUMBER
        });
        console.log('SMS sent successfully:', { messageSid: message.sid });
        return { success: true, messageSid: message.sid };
    } catch (error) {
        console.error('Error sending SMS:', {
            error: error.message,
            code: error.code,
            status: error.status,
            stack: error.stack
        });
        return { success: false, error: error.message };
    }
};

const generateJWTToken = (userId, phoneNumber) => {
    return jwt.sign(
        { userId, phoneNumber },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

const checkUserExists = async (phoneNumber) => {
    try {
        const usersRef = db.collection('users');
        const userQuery = await usersRef.where('phoneNumber', '==', phoneNumber).get();
        
        if (userQuery.empty) {
            return { exists: false, user: null };
        }
        
        const userDoc = userQuery.docs[0];
        return { exists: true, user: { id: userDoc.id, ...userDoc.data() } };
    } catch (error) {
        console.error('Error checking user existence:', error);
        throw error;
    }
};

const storeOTP = async (phoneNumber, otp) => {
    try {
        const timestamp = new Date();
        const ttlTimestamp = new Date();
        ttlTimestamp.setMinutes(ttlTimestamp.getMinutes() + 5);
        
        await db.collection('otps').doc(phoneNumber).set({
            otp,
            timestamp,
            ttl: ttlTimestamp,
            attempts: 0
        });
        
        console.log('OTP stored successfully:', { phoneNumber, timestamp });
        return true;
    } catch (error) {
        console.error('Error storing OTP:', error);
        throw error;
    }
};

const verifyStoredOTP = async (phoneNumber, providedOTP) => {
    try {
        const otpRef = db.collection('otps').doc(phoneNumber);
        const otpDoc = await otpRef.get();

        if (!otpDoc.exists) {
            return { valid: false, error: 'OTP not found or expired' };
        }

        const otpData = otpDoc.data();
        const otpTimestamp = otpData.timestamp.toDate();
        const currentTime = new Date();
        const timeDiff = (currentTime - otpTimestamp) / 1000 / 60;

        if (timeDiff > 5) {
            await otpRef.delete();
            return { valid: false, error: 'OTP has expired' };
        }

        if (otpData.attempts >= 3) {
            await otpRef.delete();
            return { valid: false, error: 'Maximum verification attempts exceeded' };
        }

        if (otpData.otp !== providedOTP) {
            await otpRef.update({ attempts: otpData.attempts + 1 });
            return { valid: false, error: 'Invalid OTP' };
        }

        await otpRef.delete();
        console.log('OTP verified and deleted successfully');
        return { valid: true };
    } catch (error) {
        console.error('Error verifying OTP:', error);
        throw error;
    }
};

const sendOTP = async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        
        console.log('Send OTP request received:', {
            phoneNumber,
            headers: req.headers,
            ip: req.ip,
            timestamp: new Date().toISOString()
        });

        if (!phoneNumber) {
            console.log('Send OTP validation failed: Phone number is missing');
            return res.status(400).json({ 
                success: false, 
                message: 'Phone number is required' 
            });
        }

        if (!isValidPhoneNumber(phoneNumber)) {
            console.log('Send OTP validation failed: Invalid phone number format', { phoneNumber });
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide a valid phone number' 
            });
        }

        const otp = generateOTP();
        console.log('Generated OTP:', { phoneNumber, otpLength: otp.length });
        
        try {
            await storeOTP(phoneNumber, otp);
            console.log('OTP stored successfully in database');
        } catch (dbError) {
            console.error('Failed to store OTP in database:', dbError);
            throw dbError;
        }

        const smsResult = await sendSMS(phoneNumber, otp);
        console.log('SMS sending result:', smsResult);
        
        if (!smsResult.success) {
            console.error('Failed to send SMS:', smsResult.error);
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to send verification code. Please try again.' 
            });
        }

        console.log('OTP process completed successfully:', { 
            phoneNumber,
            messageSid: smsResult.messageSid,
            timestamp: new Date().toISOString()
        });
        
        res.status(200).json({
            success: true,
            message: 'Verification code sent successfully',
            data: { phoneNumber }
        });

    } catch (error) {
        console.error('Error in sendOTP:', {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

const verifyOTPSignIn = async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;
        
        console.log('Verify OTP Sign In request:', { phoneNumber, otp });

        if (!phoneNumber || !otp) {
            return res.status(400).json({ 
                success: false, 
                message: 'Phone number and verification code are required' 
            });
        }

        const otpResult = await verifyStoredOTP(phoneNumber, otp);
        
        if (!otpResult.valid) {
            return res.status(400).json({ 
                success: false, 
                message: otpResult.error 
            });
        }

        const userResult = await checkUserExists(phoneNumber);
        
        if (!userResult.exists) {
            return res.status(404).json({ 
                success: false, 
                message: 'No account found with this phone number. Please sign up first.' 
            });
        }

        const user = userResult.user;

        const usersRef = db.collection('users');
        await usersRef.doc(user.id).update({
            lastSignIn: new Date(),
            signInCount: (user.signInCount || 0) + 1
        });

        const token = generateJWTToken(user.id, user.phoneNumber);

        console.log('Sign in successful:', { userId: user.id, phoneNumber });

        res.status(200).json({
            success: true,
            message: 'Sign in successful',
            data: {
                token,
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    createdAt: user.createdAt
                }
            }
        });

    } catch (error) {
        console.error('Error in verifyOTPSignIn:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

const verifyOTPSignUp = async (req, res) => {
    try {
        const { phoneNumber, otp, userData } = req.body;
        
        console.log('Verify OTP Sign Up request:', { phoneNumber, otp, userData });

        if (!phoneNumber || !otp || !userData) {
            return res.status(400).json({ 
                success: false, 
                message: 'Phone number, verification code, and user data are required' 
            });
        }

        const { firstName, lastName, email } = userData;

        if (!firstName || !lastName || !email) {
            return res.status(400).json({ 
                success: false, 
                message: 'First name, last name, and email are required' 
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide a valid email address' 
            });
        }

        const otpResult = await verifyStoredOTP(phoneNumber, otp);
        
        if (!otpResult.valid) {
            return res.status(400).json({ 
                success: false, 
                message: otpResult.error 
            });
        }

        const userResult = await checkUserExists(phoneNumber);
        
        if (userResult.exists) {
            return res.status(409).json({ 
                success: false, 
                message: 'An account with this phone number already exists. Please sign in instead.' 
            });
        }

        const usersRef = db.collection('users');
        const emailQuery = await usersRef.where('email', '==', email).get();
        
        if (!emailQuery.empty) {
            return res.status(409).json({ 
                success: false, 
                message: 'An account with this email already exists' 
            });
        }

        const userId = uuidv4();
        const timestamp = new Date();
        
        const newUser = {
            id: userId,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.toLowerCase().trim(),
            phoneNumber,
            createdAt: timestamp,
            lastSignIn: timestamp,
            signInCount: 1,
            isActive: true
        };

        await usersRef.doc(userId).set(newUser);

        const token = generateJWTToken(userId, phoneNumber);

        console.log('Account created successfully:', { userId, phoneNumber, email });

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            data: {
                token,
                user: {
                    id: userId,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    email: newUser.email,
                    phoneNumber: newUser.phoneNumber,
                    createdAt: newUser.createdAt
                }
            }
        });

    } catch (error) {
        console.error('Error in verifyOTPSignUp:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};


const signOut = async (req, res) => {
    try {
        console.log('User signed out');
        
        res.status(200).json({
            success: true,
            message: 'Signed out successfully'
        });
    } catch (error) {
        console.error('Error in signOut:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

module.exports = {
    sendOTP,
    verifyOTPSignIn,
    verifyOTPSignUp,
    signOut
};