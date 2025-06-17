const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    console.log('=== Authentication Middleware ===');
    console.log('Request path:', req.path);
    console.log('Request method:', req.method);
    
    const authHeader = req.headers['authorization'];
    console.log('Auth header present:', !!authHeader);
    
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    console.log('Token present:', !!token);

    if (!token) {
        console.log('Error: No token provided');
        return res.status(401).json({ 
            success: false, 
            message: 'Authentication token is required' 
        });
    }

    try {
        console.log('Verifying token...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token verified successfully:', {
            userId: decoded.userId,
            exp: decoded.exp
        });
        req.user = decoded; // Add user info to request object
        next();
    } catch (error) {
        console.error('Token verification failed:', {
            error: error.message,
            name: error.name,
            expiredAt: error.expiredAt
        });
        return res.status(403).json({ 
            success: false, 
            message: 'Invalid or expired token',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    authenticateToken
}; 