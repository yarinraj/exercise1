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
//func that find anf return a user by their unique id
const getUserById=(userId)=>{
    //the find() method iterates over the users array.
    // It checks each user, and if 'user.id' matches the 'userId' we received, it returns that user object.
    // If it finishes scanning the array and finds nothing, it automatically returns 'undefined'.
    return users.find(user=>user.id==userId);
}
// Export the function and the users array so they can be imported and used in other files
module.exports = {
    createUser,
    getUserById,
    users 
};