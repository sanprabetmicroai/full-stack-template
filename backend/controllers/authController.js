const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase');
const twilioClient = require('../config/twilio');
const { v4: uuidv4 } = require('uuid');
const { sendEmail } = require('../utils/emailService');

// OTP Tags for different purposes
const OTP_TAGS = {
    SIGNUP: 'signup',
    LOGIN: 'login',
    UPDATE_PHONE: 'update_phone',
    UPDATE_EMAIL: 'update_email'
};

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

const checkUserExists = async (identifier, type = 'phone') => {
    try {
        console.log('checkUserExists called with:', { identifier, type });
        const usersRef = db.collection('users');
        let userQuery;
        
        if (type === 'phone') {
            console.log('Querying users collection for phoneNumber:', identifier);
            userQuery = await usersRef.where('phoneNumber', '==', identifier).get();
        } else if (type === 'email') {
            console.log('Querying users collection for email:', identifier);
            userQuery = await usersRef.where('email', '==', identifier).get();
        } else {
            console.error('Invalid type provided to checkUserExists:', type);
            throw new Error(`Invalid type: ${type}`);
        }
        
        console.log('Query result:', { 
            empty: userQuery.empty, 
            size: userQuery.size,
            docs: userQuery.docs.map(doc => ({ id: doc.id, data: doc.data() }))
        });
        
        if (userQuery.empty) {
            console.log('No user found for identifier:', identifier);
            return { exists: false, user: null };
        }
        
        const userDoc = userQuery.docs[0];
        console.log('User found:', { id: userDoc.id, data: userDoc.data() });
        return { exists: true, user: { id: userDoc.id, ...userDoc.data() } };
    } catch (error) {
        console.error('Error checking user existence:', {
            error: error.message,
            stack: error.stack,
            identifier,
            type
        });
        throw error;
    }
};

// Updated OTP storage with UUID and tags
const storeOTP = async (identifier, otp, tag, identifierType = 'phone') => {
    try {
        const otpId = uuidv4();
        const timestamp = new Date();
        const ttlTimestamp = new Date();
        ttlTimestamp.setMinutes(ttlTimestamp.getMinutes() + 5);
        
        await db.collection('otps').doc(otpId).set({
            identifier,
            identifierType, // 'phone' or 'email'
            otp,
            tag, // 'signup', 'login', 'update_phone', 'update_email'
            timestamp,
            ttl: ttlTimestamp,
            attempts: 0
        });
        
        console.log('OTP stored successfully:', { 
            otpId, 
            identifier, 
            identifierType, 
            tag, 
            timestamp 
        });
        return otpId;
    } catch (error) {
        console.error('Error storing OTP:', error);
        throw error;
    }
};

// New function to check if resend is allowed (30-second cooldown)
const checkResendAllowed = async (identifier, tag, identifierType = 'phone') => {
    try {
        const otpsRef = db.collection('otps');
        
        // Use a simpler query that doesn't require a composite index
        // First, get all OTPs for this identifier and filter in memory
        const otpQuery = await otpsRef
            .where('identifier', '==', identifier)
            .get();

        if (otpQuery.empty) {
            return { allowed: true, timeRemaining: 0 };
        }

        // Filter by tag and identifierType in memory
        const matchingOTPs = otpQuery.docs.filter(doc => {
            const data = doc.data();
            return data.tag === tag && data.identifierType === identifierType;
        });

        if (matchingOTPs.length === 0) {
            return { allowed: true, timeRemaining: 0 };
        }

        // Sort by timestamp descending and get the most recent
        const sortedOTPs = matchingOTPs.sort((a, b) => {
            const aTime = a.data().timestamp.toDate();
            const bTime = b.data().timestamp.toDate();
            return bTime - aTime; // Descending order
        });

        const latestOTP = sortedOTPs[0];
        const otpData = latestOTP.data();
        const otpTimestamp = otpData.timestamp.toDate();
        const currentTime = new Date();
        const timeDiff = (currentTime - otpTimestamp) / 1000; // in seconds
        const cooldownPeriod = 30; // 30 seconds

        if (timeDiff >= cooldownPeriod) {
            return { allowed: true, timeRemaining: 0 };
        } else {
            const remainingTime = Math.ceil(cooldownPeriod - timeDiff);
            return { allowed: false, timeRemaining: remainingTime };
        }
    } catch (error) {
        console.error('Error checking resend allowed:', error);
        throw error;
    }
};

// Updated OTP verification with UUID and tags
const verifyStoredOTP = async (identifier, providedOTP, tag, identifierType = 'phone') => {
    try {
        const otpsRef = db.collection('otps');
        
        // Use a simpler query that doesn't require a composite index
        // First, get all OTPs for this identifier and filter in memory
        const otpQuery = await otpsRef
            .where('identifier', '==', identifier)
            .get();

        if (otpQuery.empty) {
            return { valid: false, error: 'OTP not found or expired' };
        }

        // Filter by tag and identifierType in memory
        const matchingOTPs = otpQuery.docs.filter(doc => {
            const data = doc.data();
            return data.tag === tag && data.identifierType === identifierType;
        });

        if (matchingOTPs.length === 0) {
            return { valid: false, error: 'OTP not found or expired' };
        }

        // Sort by timestamp descending and get the most recent
        const sortedOTPs = matchingOTPs.sort((a, b) => {
            const aTime = a.data().timestamp.toDate();
            const bTime = b.data().timestamp.toDate();
            return bTime - aTime; // Descending order
        });

        const otpDoc = sortedOTPs[0];
        const otpData = otpDoc.data();
        const otpTimestamp = otpData.timestamp.toDate();
        const currentTime = new Date();
        const timeDiff = (currentTime - otpTimestamp) / 1000 / 60;

        if (timeDiff > 5) {
            await otpDoc.ref.delete();
            return { valid: false, error: 'OTP has expired' };
        }

        if (otpData.attempts >= 3) {
            await otpDoc.ref.delete();
            return { valid: false, error: 'Maximum verification attempts exceeded' };
        }

        if (otpData.otp !== providedOTP) {
            await otpDoc.ref.update({ attempts: otpData.attempts + 1 });
            return { valid: false, error: 'Invalid OTP' };
        }

        await otpDoc.ref.delete();
        console.log('OTP verified and deleted successfully');
        return { valid: true };
    } catch (error) {
        console.error('Error verifying OTP:', error);
        throw error;
    }
};

// Updated sendOTP to support both email and phone with tags
const sendOTP = async (req, res) => {
    try {
        const { identifier, identifierType = 'phone', tag } = req.body;
        
        console.log('=== SEND OTP REQUEST START ===');
        console.log('Send OTP request received:', {
            identifier,
            identifierType,
            tag,
            headers: req.headers,
            ip: req.ip,
            timestamp: new Date().toISOString()
        });
        console.log('OTP_TAGS values:', OTP_TAGS);
        console.log('Tag comparison results:', {
            isLogin: tag === OTP_TAGS.LOGIN,
            isSignup: tag === OTP_TAGS.SIGNUP,
            tagType: typeof tag,
            loginTagType: typeof OTP_TAGS.LOGIN,
            signupTagType: typeof OTP_TAGS.SIGNUP
        });

        if (!identifier) {
            console.log('Send OTP validation failed: Identifier is missing');
            return res.status(400).json({ 
                success: false, 
                message: 'Identifier (phone number or email) is required' 
            });
        }

        if (!tag || !Object.values(OTP_TAGS).includes(tag)) {
            console.log('Send OTP validation failed: Invalid or missing tag');
            console.log('Valid tags:', Object.values(OTP_TAGS));
            console.log('Received tag:', tag);
            return res.status(400).json({ 
                success: false, 
                message: 'Valid tag is required (signup, login, update_phone, update_email)' 
            });
        }

        // Validate identifier based on type
        if (identifierType === 'phone') {
            if (!isValidPhoneNumber(identifier)) {
                console.log('Send OTP validation failed: Invalid phone number format', { identifier });
                return res.status(400).json({ 
                    success: false, 
                    message: 'Please provide a valid phone number' 
                });
            }
        } else if (identifierType === 'email') {
            if (!isValidEmail(identifier)) {
                console.log('Send OTP validation failed: Invalid email format', { identifier });
                return res.status(400).json({ 
                    success: false, 
                    message: 'Please provide a valid email address' 
                });
            }
        } else {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid identifier type. Must be "phone" or "email"' 
            });
        }

        // Check if user exists for login attempts
        if (tag === OTP_TAGS.LOGIN) {
            console.log('=== LOGIN ATTEMPT CHECK ===');
            console.log('Checking if user exists for login attempt:', { identifier, identifierType, tag });
            console.log('OTP_TAGS.LOGIN value:', OTP_TAGS.LOGIN);
            console.log('Tag comparison result:', tag === OTP_TAGS.LOGIN);
            
            try {
                const userResult = await checkUserExists(identifier, identifierType);
                console.log('User existence check result:', userResult);
                
                if (!userResult.exists) {
                    console.log('Login attempt failed: No account found for identifier:', { identifier, identifierType });
                    return res.status(404).json({ 
                        success: false, 
                        message: `No account found with this ${identifierType}. Please sign up first.` 
                    });
                }
                
                console.log('User found for login attempt:', { 
                    userId: userResult.user.id,
                    identifier,
                    identifierType 
                });
            } catch (checkError) {
                console.error('Error during user existence check:', {
                    error: checkError.message,
                    stack: checkError.stack,
                    identifier,
                    identifierType
                });
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error checking user account. Please try again.' 
                });
            }
            console.log('=== END LOGIN ATTEMPT CHECK ===');
        } else if (tag === OTP_TAGS.SIGNUP) {
            console.log('=== SIGNUP ATTEMPT CHECK ===');
            console.log('Checking if user already exists for signup attempt:', { identifier, identifierType, tag });
            console.log('OTP_TAGS.SIGNUP value:', OTP_TAGS.SIGNUP);
            console.log('Tag comparison result:', tag === OTP_TAGS.SIGNUP);
            
            try {
                const userResult = await checkUserExists(identifier, identifierType);
                console.log('User existence check result:', userResult);
                
                if (userResult.exists) {
                    console.log('Signup attempt failed: Account already exists for identifier:', { identifier, identifierType });
                    return res.status(409).json({ 
                        success: false, 
                        message: `An account with this ${identifierType} already exists. Please sign in instead.` 
                    });
                }
                
                console.log('No existing user found, proceeding with signup for:', { 
                    identifier,
                    identifierType 
                });
            } catch (checkError) {
                console.error('Error during user existence check for signup:', {
                    error: checkError.message,
                    stack: checkError.stack,
                    identifier,
                    identifierType
                });
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error checking user account. Please try again.' 
                });
            }
            console.log('=== END SIGNUP ATTEMPT CHECK ===');
        } else {
            console.log('Not a login or signup attempt, skipping user existence check. Tag:', tag);
        }

        const otp = generateOTP();
        console.log('Generated OTP:', { identifier, identifierType, tag, otp });
        
        try {
            await storeOTP(identifier, otp, tag, identifierType);
            console.log('OTP stored successfully in database');
        } catch (dbError) {
            console.error('Failed to store OTP in database:', dbError);
            throw dbError;
        }

        // In development mode, just log the OTP instead of sending
        if (process.env.NODE_ENV === 'development') {
            console.log('DEVELOPMENT MODE: OTP for', identifier, 'is:', otp);
            return res.status(200).json({
                success: true,
                message: 'Verification code sent successfully (development mode)',
                data: { 
                    identifier,
                    identifierType,
                    tag,
                    otp // Only include OTP in development mode
                }
            });
        }

        let sendResult;
        if (identifierType === 'phone') {
            sendResult = await sendSMS(identifier, otp);
        } else if (identifierType === 'email') {
            const emailText = `Your verification code is: ${otp}. Valid for 5 minutes.`;
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Your Verification Code</h2>
                    <p style="font-size: 16px; color: #666;">Your verification code is:</p>
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                        <span style="font-size: 24px; font-weight: bold; color: #333;">${otp}</span>
                    </div>
                    <p style="font-size: 14px; color: #999;">This code is valid for 5 minutes.</p>
                </div>
            `;
            await sendEmail(identifier, 'Verification Code', emailText, emailHtml);
            sendResult = { success: true };
        }
        
        console.log('OTP sending result:', sendResult);
        
        if (!sendResult.success) {
            console.error('Failed to send OTP:', sendResult.error);
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to send verification code. Please try again.' 
            });
        }

        console.log('OTP process completed successfully:', { 
            identifier,
            identifierType,
            tag,
            timestamp: new Date().toISOString()
        });
        console.log('=== SEND OTP REQUEST END ===');
        
        res.status(200).json({
            success: true,
            message: 'Verification code sent successfully',
            data: { identifier, identifierType, tag }
        });

    } catch (error) {
        console.error('Error in sendOTP:', {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        console.log('=== SEND OTP REQUEST ERROR END ===');
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

// Updated verifyOTPSignIn to support both email and phone
const verifyOTPSignIn = async (req, res) => {
    try {
        const { identifier, identifierType = 'phone', otp } = req.body;
        
        console.log('Verify OTP Sign In request received:', { 
            identifier, 
            identifierType,
            otp,
            headers: req.headers,
            ip: req.ip,
            timestamp: new Date().toISOString()
        });

        if (!identifier || !otp) {
            console.log('Verify OTP Sign In validation failed:', { 
                hasIdentifier: !!identifier, 
                hasOTP: !!otp 
            });
            return res.status(400).json({ 
                success: false, 
                message: 'Identifier and verification code are required' 
            });
        }

        console.log('Verifying stored OTP...');
        const otpResult = await verifyStoredOTP(identifier, otp, OTP_TAGS.LOGIN, identifierType);
        console.log('OTP verification result:', otpResult);
        
        if (!otpResult.valid) {
            console.log('OTP verification failed:', otpResult.error);
            return res.status(400).json({ 
                success: false, 
                message: otpResult.error 
            });
        }

        console.log('Checking if user exists...');
        const userResult = await checkUserExists(identifier, identifierType);
        console.log('User check result:', { 
            exists: userResult.exists,
            userId: userResult.user?.id
        });
        
        if (!userResult.exists) {
            console.log('User not found for identifier:', identifier);
            return res.status(404).json({ 
                success: false, 
                message: `No account found with this ${identifierType}. Please sign up first.` 
            });
        }

        const user = userResult.user;
        console.log('Updating user sign-in data...');

        const usersRef = db.collection('users');
        await usersRef.doc(user.id).update({
            lastSignIn: new Date(),
            signInCount: (user.signInCount || 0) + 1
        });

        const token = generateJWTToken(user.id, user.phoneNumber);
        console.log('JWT token generated successfully');

        console.log('Sign-in verification completed successfully:', {
            userId: user.id,
            identifier,
            identifierType,
            timestamp: new Date().toISOString()
        });

        res.status(200).json({
            success: true,
            message: 'Sign-in successful',
            data: {
                token,
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    email_verified: user.email_verified,
                    phone_verified: user.phone_verified
                }
            }
        });

    } catch (error) {
        console.error('Error in verifyOTPSignIn:', {
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

// Updated verifyOTPSignUp to support both email and phone
const verifyOTPSignUp = async (req, res) => {
    try {
        const { identifier, identifierType = 'phone', otp, userData } = req.body;
        
        console.log('Verify OTP Sign Up request:', { identifier, identifierType, otp, userData });

        if (!identifier || !otp || !userData) {
            return res.status(400).json({ 
                success: false, 
                message: 'Identifier, verification code, and user data are required' 
            });
        }

        const { firstName, lastName, email, phoneNumber } = userData;

        if (!firstName || !lastName) {
            return res.status(400).json({ 
                success: false, 
                message: 'First name and last name are required' 
            });
        }

        // Validate that we have either email or phone number
        if (!email && !phoneNumber) {
            return res.status(400).json({ 
                success: false, 
                message: 'Either email or phone number is required' 
            });
        }

        if (email && !isValidEmail(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide a valid email address' 
            });
        }

        if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide a valid phone number' 
            });
        }

        const otpResult = await verifyStoredOTP(identifier, otp, OTP_TAGS.SIGNUP, identifierType);
        
        if (!otpResult.valid) {
            return res.status(400).json({ 
                success: false, 
                message: otpResult.error 
            });
        }

        // Check if user already exists with the identifier
        const userResult = await checkUserExists(identifier, identifierType);
        
        if (userResult.exists) {
            return res.status(409).json({ 
                success: false, 
                message: `An account with this ${identifierType} already exists. Please sign in instead.` 
            });
        }

        const usersRef = db.collection('users');
        
        // Check if email is already in use (if provided)
        if (email) {
            const emailQuery = await usersRef.where('email', '==', email).get();
            if (!emailQuery.empty) {
                return res.status(409).json({ 
                    success: false, 
                    message: 'An account with this email already exists' 
                });
            }
        }

        // Check if phone number is already in use (if provided)
        if (phoneNumber) {
            const phoneQuery = await usersRef.where('phoneNumber', '==', phoneNumber).get();
            if (!phoneQuery.empty) {
                return res.status(409).json({ 
                    success: false, 
                    message: 'An account with this phone number already exists' 
                });
            }
        }

        const userId = uuidv4();
        const timestamp = new Date();
        
        const userDataToStore = {
            id: userId,
            firstName,
            lastName,
            email: email || null,
            phoneNumber: phoneNumber || null,
            // Don't set verification fields during signup - only set them when user updates via OTP
            createdAt: timestamp,
            updatedAt: timestamp,
            lastSignIn: timestamp,
            signInCount: 1
        };

        await usersRef.doc(userId).set(userDataToStore);
        console.log('User account created successfully:', { userId, identifier, identifierType });

        const token = generateJWTToken(userId, phoneNumber);
        console.log('JWT token generated for new user');

        console.log('Sign-up verification completed successfully:', {
            userId,
            identifier,
            identifierType,
            timestamp: new Date().toISOString()
        });

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            data: {
                token,
                user: userDataToStore
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
        console.log('=== Sign Out Request ===');
        console.log('Request body:', req.body);
        console.log('Auth user:', req.user);
        
        const { rating, feedback } = req.body;
        const userId = req.user?.userId;

        console.log('Sign out data:', {
            userId,
            hasRating: !!rating,
            hasFeedback: !!feedback,
            rating,
            feedback
        });

        if (userId) {
            console.log('Saving feedback to database...');
            const feedbackRef = db.collection('feedback');
            const feedbackDoc = await feedbackRef.add({
                userId,
                rating,
                feedback,
                createdAt: new Date()
            });
            console.log('Feedback saved successfully:', {
                feedbackId: feedbackDoc.id,
                userId,
                timestamp: new Date().toISOString()
            });
        } else {
            console.warn('No userId found in request, skipping feedback save');
        }

        console.log('User signed out successfully');
        res.status(200).json({
            success: true,
            message: 'Signed out successfully'
        });
    } catch (error) {
        console.error('Error in signOut:', {
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

// Test email with OTP
const testEmailOTP = async (req, res) => {
    try {
        const testEmail = 'your-test-email@example.com'; // Replace with your email
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
        
        const emailText = `Your OTP code is: ${otp}\n\nThis is a test email from your application.`;
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Your OTP Code</h2>
                <p style="font-size: 16px; color: #666;">Your verification code is:</p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                    <span style="font-size: 24px; font-weight: bold; color: #333;">${otp}</span>
                </div>
                <p style="font-size: 14px; color: #999;">This is a test email from your application.</p>
            </div>
        `;

        await sendEmail(
            testEmail,
            'Test OTP Email',
            emailText,
            emailHtml
        );

        res.status(200).json({
            success: true,
            message: 'Test email sent successfully',
            otp: otp // Only for testing, remove in production
        });
    } catch (error) {
        console.error('Error sending test email:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send test email',
            error: error.message
        });
    }
};

// Request OTP for updating email or phone
const requestUpdateOTP = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { type, value } = req.body;
        
        if (!['email', 'phone'].includes(type)) {
            return res.status(400).json({ success: false, message: 'Invalid type' });
        }
        if (!value) {
            return res.status(400).json({ success: false, message: 'Value is required' });
        }

        // Validate the value based on type
        if (type === 'email') {
            if (!isValidEmail(value)) {
                return res.status(400).json({ success: false, message: 'Invalid email' });
            }
        } else {
            if (!isValidPhoneNumber(value)) {
                return res.status(400).json({ success: false, message: 'Invalid phone number' });
            }
        }

        const otp = generateOTP();
        const identifierType = type === 'email' ? 'email' : 'phone';
        const tag = type === 'email' ? OTP_TAGS.UPDATE_EMAIL : OTP_TAGS.UPDATE_PHONE;

        // Store OTP using the unified system
        await storeOTP(value, otp, tag, identifierType);

        // Send OTP based on type
        if (type === 'email') {
            const emailText = `Your OTP code for updating your email is: ${otp}. Valid for 5 minutes.`;
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Email Update Verification</h2>
                    <p style="font-size: 16px; color: #666;">Your verification code for updating your email is:</p>
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                        <span style="font-size: 24px; font-weight: bold; color: #333;">${otp}</span>
                    </div>
                    <p style="font-size: 14px; color: #999;">This code is valid for 5 minutes.</p>
                </div>
            `;
            await sendEmail(value, 'Email Update OTP', emailText, emailHtml);
        } else {
            const sendResult = await sendSMS(value, otp);
            if (!sendResult.success) {
                return res.status(500).json({ 
                    success: false, 
                    message: 'Failed to send OTP', 
                    error: sendResult.error 
                });
            }
        }

        res.status(200).json({ 
            success: true, 
            message: 'OTP sent successfully',
            data: { identifier: value, identifierType, tag }
        });
    } catch (error) {
        console.error('Error in requestUpdateOTP:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Verify OTP and update email/phone
const verifyUpdateOTP = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { type, value, otp } = req.body;
        
        if (!['email', 'phone'].includes(type)) {
            return res.status(400).json({ success: false, message: 'Invalid type' });
        }
        if (!value || !otp) {
            return res.status(400).json({ success: false, message: 'Value and OTP are required' });
        }

        const identifierType = type === 'email' ? 'email' : 'phone';
        const tag = type === 'email' ? OTP_TAGS.UPDATE_EMAIL : OTP_TAGS.UPDATE_PHONE;

        // Verify OTP using the unified system
        const otpResult = await verifyStoredOTP(value, otp, tag, identifierType);
        
        if (!otpResult.valid) {
            return res.status(400).json({ success: false, message: otpResult.error });
        }

        // Update user info
        const usersRef = db.collection('users');
        
        if (type === 'email') {
            // Check if email is already in use by another user
            const emailQuery = await usersRef.where('email', '==', value).get();
            if (!emailQuery.empty) {
                const existingUser = emailQuery.docs[0];
                if (existingUser.id !== userId) {
                    return res.status(409).json({ 
                        success: false, 
                        message: 'Email already in use by another account' 
                    });
                }
            }
            await usersRef.doc(userId).update({ 
                email: value, 
                email_verified: true, 
                updatedAt: new Date() 
            });
        } else {
            // Check if phone is already in use by another user
            const phoneQuery = await usersRef.where('phoneNumber', '==', value).get();
            if (!phoneQuery.empty) {
                const existingUser = phoneQuery.docs[0];
                if (existingUser.id !== userId) {
                    return res.status(409).json({ 
                        success: false, 
                        message: 'Phone number already in use by another account' 
                    });
                }
            }
            await usersRef.doc(userId).update({ 
                phoneNumber: value, 
                phone_verified: true,
                updatedAt: new Date() 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: `${type} updated successfully`,
            data: { updatedField: type, newValue: value }
        });
    } catch (error) {
        console.error('Error in verifyUpdateOTP:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Check if resend is allowed for a specific identifier and tag
const checkResendStatus = async (req, res) => {
    try {
        const { identifier, identifierType = 'phone', tag } = req.body;
        
        console.log('Check resend status request received:', {
            identifier,
            identifierType,
            tag,
            headers: req.headers,
            ip: req.ip,
            timestamp: new Date().toISOString()
        });

        if (!identifier) {
            console.log('Check resend status validation failed: Identifier is missing');
            return res.status(400).json({ 
                success: false, 
                message: 'Identifier is required' 
            });
        }

        if (!tag || !Object.values(OTP_TAGS).includes(tag)) {
            console.log('Check resend status validation failed: Invalid or missing tag');
            return res.status(400).json({ 
                success: false, 
                message: 'Valid tag is required (signup, login, update_phone, update_email)' 
            });
        }

        // Validate identifier based on type
        if (identifierType === 'phone') {
            if (!isValidPhoneNumber(identifier)) {
                console.log('Check resend status validation failed: Invalid phone number format', { identifier });
                return res.status(400).json({ 
                    success: false, 
                    message: 'Please provide a valid phone number' 
                });
            }
        } else if (identifierType === 'email') {
            if (!isValidEmail(identifier)) {
                console.log('Check resend status validation failed: Invalid email format', { identifier });
                return res.status(400).json({ 
                    success: false, 
                    message: 'Please provide a valid email address' 
                });
            }
        } else {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid identifier type. Must be "phone" or "email"' 
            });
        }

        const resendStatus = await checkResendAllowed(identifier, tag, identifierType);
        
        console.log('Resend status check completed:', {
            identifier,
            identifierType,
            tag,
            allowed: resendStatus.allowed,
            timeRemaining: resendStatus.timeRemaining,
            timestamp: new Date().toISOString()
        });

        res.status(200).json({
            success: true,
            data: {
                allowed: resendStatus.allowed,
                timeRemaining: resendStatus.timeRemaining
            }
        });

    } catch (error) {
        console.error('Error in checkResendStatus:', {
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


module.exports = {
    sendOTP,
    verifyOTPSignIn,
    verifyOTPSignUp,
    signOut,
    testEmailOTP,
    requestUpdateOTP,
    verifyUpdateOTP,
    checkResendStatus
};