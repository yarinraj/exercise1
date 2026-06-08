// Import the MongoDB User model instead of the local user service
const User = require('../models/user'); 
// Import JWT library for token generation
const jwt = require('jsonwebtoken'); 
// Import crypto for hashing the password before comparison
const crypto = require('crypto'); 

// Marked as async because we are querying the MongoDB database
const createToken = async (req, res) => {
    try {
        // Extract username and password from the request body
        const { username, password } = req.body;

        // Validation: Make sure both fields are provided
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        // Fetch the user from the MongoDB database
        const user = await User.findOne({ username });

        // Hash the incoming password using SHA-256 to match the database hash
        const hashedInputPassword = crypto.createHash('sha256').update(password).digest('hex');

        // Verify if user exists and if the hashed input matches the database hash
        // Using 401 Unauthorized for failed login attempts
        if (!user || user.password !== hashedInputPassword) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        // Generate a secure JWT containing the user ID and username
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            'my_super_secret_key', // Secret key for signing (keep this safe)
            { expiresIn: '2h' }    // Token expiration time
        );

        // Return the valid token to the client
        return res.status(200).json({ token });

    } catch (error) {
        console.error('Error creating token:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// Export the function so the router can use it
module.exports = {
    createToken
};