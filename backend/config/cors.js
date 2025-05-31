const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Default Vite dev server port
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 hours
};

module.exports = corsOptions; 