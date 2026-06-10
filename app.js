if (!globalThis.crypto) {
    globalThis.crypto = require('crypto').webcrypto;
}
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const restaurantRoutes = require('./src/routes/restaurant');
const userRoutes = require('./src/routes/user');
const tokenRoutes = require('./src/routes/token');
//Import the order router
const orderRoutes = require('./src/routes/order');
//import the controller of the resturants
const restaurantController = require('./src/controllers/restaurant');

// Middleware - allows the server to parse incoming JSON in the request body
app.use(express.json({ limit: '5mb' }));
// Map '/api/restaurants' to our restaurant router
app.use('/api/restaurants', restaurantRoutes);
//Map '/api/tokens' to our token router
app.use('/api/tokens', tokenRoutes);
// Mount the user routes to the base path '/api/users'
// Any request starting with '/api/users' will be handled by userRoutes
app.use('/api/users', userRoutes);
// Map all '/api/orders' requests to the order router
app.use('/api/orders', orderRoutes);
//search rout
app.get('/api/search/:query', restaurantController.searchItems);



// Start the server and listen on the specified port
const PORT = 8080;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/woltDB';

mongoose.connect(MONGODB_URI, {serverSelectionTimeoutMS: 5000})
  .then(() => {
  
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });