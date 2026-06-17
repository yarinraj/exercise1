if (!globalThis.crypto) {
    globalThis.crypto = require('crypto').webcrypto;
}

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const restaurantRoutes = require('./src/routes/restaurant');
const userRoutes = require('./src/routes/user');
const tokenRoutes = require('./src/routes/token');
const orderRoutes = require('./src/routes/order');
const restaurantController = require('./src/controllers/restaurant');

const app = express();

// CORS configuration for the React development server
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3000/',    
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3000/',  
    'http://localhost:8080',
    'http://localhost:8080/'   
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ['GET', 'POST','PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// Allow Express to parse JSON request bodies
app.use(express.json({ limit: '5mb' }));

// Serve static frontend files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

// Search route
app.get('/api/search/:query', restaurantController.searchItems);


// returns an 404 error for wrong API's
app.use((req, res, next) => {
    if (req.url.startsWith('/api') || req.path.includes('/api')) {
        return res.status(404).json({ error: "API endpoint not found" });
    }
    next(); 
});

// Fallback route for React client-side routing
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const PORT = 8080;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/woltDB';

mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });
