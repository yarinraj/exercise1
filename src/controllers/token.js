// We need to import the user service because that's where our user data and logic live
const userService = require('../services/user');

// Function to handle login and generate a token
const createToken = (req, res) => {
    // Extract username and password from the request body
    const { username, password } = req.body;

    // Validation: Make sure both fields are provided
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    // Call the service to check if a user with this exact username and password exists
    const user = userService.verifyUser(username, password);

    // If no matching user is found, return a 404 error
    if (!user) {
        return res.status(404).json({ error: "User not found or incorrect credentials" });
    }

    // If the user is found, return success with the token (the user's ID)
    return res.status(200).json({ token: user.id });
};

// Export the function so the router can use it
module.exports = {
    createToken
};