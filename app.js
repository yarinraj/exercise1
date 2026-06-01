const express = require('express');
const app = express();

const restaurantRoutes = require('./src/routes/restaurant');
const userRoutes = require('./src/routes/user');
const tokenRoutes = require('./src/routes/token');
//Import the order router
const orderRoutes = require('./src/routes/order');

// Middleware - allows the server to parse incoming JSON in the request body
app.use(express.json());

app.use('/api/restaurants', restaurantRoutes);
//Map '/api/tokens' to our token router
app.use('/api/tokens', tokenRoutes);
// Mount the user routes to the base path '/api/users'
// Any request starting with '/api/users' will be handled by userRoutes
app.use('/api/users', userRoutes);
// Map all '/api/orders' requests to the order router
app.use('/api/orders', orderRoutes);

// Start the server and listen on the specified port
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT} - (DELETE BEFORE SUBMITION)`);
});