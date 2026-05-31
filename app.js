const express = require('express');
const app = express();
const port = 8080;

// Import the user routes
const userRoutes = require('./api/routes/userRoutes');
//Import the token router
const tokenRoutes = require('./api/routes/tokenRoutes');

// Middleware - allows the server to parse incoming JSON in the request body
app.use(express.json());
//Map '/api/tokens' to our token router
app.use('/api/tokens', tokenRoutes);
// Mount the user routes to the base path '/api/users'
// Any request starting with '/api/users' will be handled by userRoutes
app.use('/api/users', userRoutes);

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});