const crypto = require('crypto'); 
const User = require('../models/user'); // importing the User model to interact with the users collection in MongoDB

// validating password complexity function: at least 8 characters, including letters and numbers
const validatePasswordComplexity = (password) => {
    const complexityRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    return complexityRegex.test(password);
};

// registerUser function to handle user registration (POST /api/users)
const registerUser = async (req, res) => {
    try {
        // extracting the fields from the request body
        const { username, password, displayName, profileImage } = req.body;

        // checking if all required fields are provided
        if (!username || !password || !displayName || !profileImage) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // validating password complexity
        if (!validatePasswordComplexity(password)) {
            return res.status(400).json({ 
                error: "Password is not complex enough. It must contain at least 8 characters including letters and numbers" 
            });
        }

        // checking if the username is already taken
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ error: "Username is already taken." });
        }

        // hashing the password using SHA-256 before saving to the database
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

        // saving the new user to the database with the hashed password
        const newUser = new User({
            username,
            password: hashedPassword,
            displayName,
            profileImage
        });

        await newUser.save();

        // converting the object to a clean JSON and deleting the password for security reasons before returning it to the client
        const userResponse = newUser.toObject();
        delete userResponse.password;

        return res.status(201).json(userResponse);

    } catch (err) {
        console.error("Registration Error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// getUser function to handle fetching user details by ID (GET /api/users/:id)
const getUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // async searching for the user in the database by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // removing the hashed password before returning user data for security reasons
        const userResponse = user.toObject();
        delete userResponse.password;

        return res.status(200).json(userResponse);

    } catch (err) {
        // user not found or invalid ID format will be caught here
        return res.status(404).json({ error: "User not found" });
    }
};
// Function to handle user login (POST /api/users/login)
// Function to handle user login (POST /api/users/login)
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Validate input existence
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        // 2. Find user in the database
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        // 3. Hash the provided password to compare with the stored hash
        const hashedInputPassword = crypto.createHash('sha256').update(password).digest('hex');

        // 4. Verify password match
        if (user.password !== hashedInputPassword) {
            // Returning the same error message for security reasons
            return res.status(401).json({ error: "Invalid username or password" });
        }

        // 5. Successful login: remove password from response object
        const userResponse = user.toObject();
        delete userResponse.password;

        return res.status(200).json(userResponse);

    } catch (err) {
        // Log the actual error internally for debugging
        console.error("Login System Error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};
module.exports = {
    registerUser,
    getUser,
    login
};
