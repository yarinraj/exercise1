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
const MONGODB_URI = 'mongodb://127.0.0.1:27017/woltDB';
console.log('Attempting to connect to MongoDB...'); // visual feedback for connection attempt (delete if not needed)
// Connect to MongoDB using Mongoose
mongoose.connect(MONGODB_URI, {serverSelectionTimeoutMS: 5000})
  .then(() => {
    console.log('Successfully connected to MongoDB!');
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });