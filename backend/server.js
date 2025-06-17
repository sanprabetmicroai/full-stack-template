const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');
const userRoutes = require('./routes/userRoutes');
const corsOptions = require('./config/cors');

console.log('Starting server initialization...');

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

// Add detailed logging middleware
app.use((req, res, next) => {
    console.log('Incoming request:', {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body
    });
    next();
});

// Basic health check endpoint
app.get('/', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);

// Add 404 handler
app.use((req, res, next) => {
    console.log('404 Not Found:', req.method, req.url);
    res.status(404).json({ error: `Cannot ${req.method} ${req.url}` });
});

app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 8080;

// Log environment variables (excluding sensitive ones)
console.log('Environment configuration:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: PORT,
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Available routes:');
    console.log('- GET / (health check)');
    console.log('- POST /api/auth/send-otp');
    console.log('- POST /api/auth/verify-signin');
    console.log('- POST /api/auth/verify-signup');
    console.log('- POST /api/auth/signout');
    console.log('- POST /api/ai/gemini');
    console.log('- POST /api/ai/chatgpt');
    console.log('- GET /api/users/:uid');
    console.log('- PUT /api/users/:uid');
});

// Handle server errors
server.on('error', (error) => {
    console.error('Server error:', error);
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
    }
}); 