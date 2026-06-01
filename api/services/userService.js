// Import the v4 function from the 'uuid' library to generate unique IDs
const { v4: uuidv4 } = require('uuid');
// In-memory array to store all registered users (acts as our temporary database)
const users = [];
// Function to create a new user, assign a unique ID, and save it to the array
const createUser = (userData) => {
    const newUser = {
        // Generate a unique, random identifier for the new user
        id: uuidv4(),
        // Spread the rest of the user data (username, password, address, phone)
        ...userData
    };
    // Add the new user to our in-memory array
    users.push(newUser);
    // Return the created user object to the controller
    return newUser;
};
// Export the function and the users array so they can be imported and used in other files
module.exports = {
    createUser,
    users 
};