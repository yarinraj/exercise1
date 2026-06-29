// Import the MongoDB User model
const User = require('../models/user');

// Import JWT library for token generation
const jwt = require('jsonwebtoken');

// Import crypto for hashing the password before comparison
const crypto = require('crypto');


// Create login token
const createToken = async (req, res) => {
     
    try {
        // Extract username and password from the request body
        const { username, password } = req.body;

        // Validate required fields
        if (!username || !password) {
            return res.status(400).json({
                error: 'Username and password are required'
            });
        }

        // Find the user in MongoDB
        const user = await User.findOne({ username });

        // Hash the incoming password using SHA-256
        const hashedInputPassword = crypto
            .createHash('sha256')
            .update(password)
            .digest('hex');

        // Validate user and password
        if (!user || user.password !== hashedInputPassword) {
            return res.status(401).json({
                error: 'Invalid username or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                username: user.username,
                role: user.role
            },
            'my_super_secret_key'
        );

        // Return token and user details to the client
        return res.status(200).json({
            token,
            user: {
                _id: user._id,
                username: user.username,
                displayName: user.displayName,
                // profileImage: user.profileImage,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Error creating token:', error);
        return res.status(500).json({
            error: 'Internal Server Error'
        });
    }
};

// Export the function so the router can use it
module.exports = {
    createToken
};