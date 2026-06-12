const express = require('express');
const router = express.Router();

// Import the user controller
const userController = require('../controllers/user');

//  IMPORT YOUR USER MODEL: Change the path if your model file name is lowercase 'user'
const User = require('../models/User'); 

// Route for registration
router.post('/', userController.registerUser);

// Route for checking username (MUST BE ABOVE /:id)
router.get('/check-username/:username', async (req, res) => {
    try {
        const { username } = req.params;

        // Search MongoDB for the username (case-insensitive)
        const existingUser = await User.findOne({ username: username.toLowerCase() });

        if (existingUser) {
            return res.status(200).json({ exists: true });
        }

        // If not found, username is available
        return res.status(200).json({ exists: false });
    } catch (error) {
        console.error('Error in check-username route:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Route for getting a specific user (Must be at the bottom)
router.get('/:id', userController.getUser);

// Export the router so it can be imported in the main application file
router.post('/login', userController.login);
module.exports = router;