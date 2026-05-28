const express = require('express');
const router = express.Router();

// Import the user controller to handle the registration logic
const userController = require('../controllers/userController');

// Define the POST route for user registration
// The path is '/' because this router will be mounted at '/api/users' in app.js
router.post('/', userController.registerUser);

// Export the router so it can be imported in the main application file
module.exports = router;