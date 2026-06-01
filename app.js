const express = require('express');
const app = express();
const port = 8080;

// Import the user routes
const userRoutes = require('./api/routes/userRoutes');

// Middleware - allows the server to parse incoming JSON in the request body
app.use(express.json());

// Mount the user routes to the base path '/api/users'
// Any request starting with '/api/users' will be handled by userRoutes
app.use('/api/users', userRoutes);

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});