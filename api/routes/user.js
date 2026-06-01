const express = require('express');
const router = express.Router();

// Import the user controller to handle the registration logic
const userController = require('../controllers/user');

// Define the POST route for user registration
// The path is '/' because this router will be mounted at '/api/users' in app.js
router.post('/', userController.registerUser);
// NEW ROUTE: GET /api/users/:id - Fetch a specific user by their ID
// The colon ':' before 'id' tells Express that this is a dynamic parameter, not a static word.
// So /api/users/123 and /api/users/abc will both match this route, and the dynamic part will be saved in req.params.id
router.get('/:id', userController.getUser);
// Export the router so it can be imported in the main application file
module.exports = router;