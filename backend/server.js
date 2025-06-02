const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const corsOptions = require('./config/cors');

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

app.use('/api/auth', authRoutes);

// Add 404 handler
app.use((req, res, next) => {
    console.log('404 Not Found:', req.method, req.url);
    res.status(404).json({ error: `Cannot ${req.method} ${req.url}` });
});

app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Available routes:');
    console.log('- POST /api/auth/signup');
    console.log('- POST /api/auth/signin');
    console.log('- POST /api/auth/verify');
    console.log('- POST /api/auth/signout');
}); 