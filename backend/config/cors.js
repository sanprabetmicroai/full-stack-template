const corsOptions = {
    origin: function(origin, callback) {
        const allowedOrigins = [
            process.env.FRONTEND_URL,
            'https://kars-frontend-57yziokfzq-uc.a.run.app',
            'http://localhost:5173'
        ].filter(Boolean); // Remove any undefined values

        console.log('CORS check:', {
            origin,
            allowedOrigins,
            frontendUrl: process.env.FRONTEND_URL
        });

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('CORS blocked:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 hours
};

module.exports = corsOptions; 