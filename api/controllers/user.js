// Import the service layer to handle business logic and data storage
const userService = require('../services/user');

const registerUser = (req, res)=>{
    //Extract user data from the request body
    const{username, password, address, phone } = req.body;
  if(!username||!password){
        return res.status(400).json({error: "Username and password are required"});
    }

    //pass the data to the service layer to create and save the new user
    const newUser = userService.createUser({username,password, address, phone});

    //return the success response 201 created along with the newly created user object
    res.status(201).json(newUser);
}
//func that handle GET request to fetch a specifin user by ID
const getUser =(req,res)=>{
    // Extract the dynamic 'id' parameter from the URL path
    // For example, if the URL is /api/users/123, req.params.id will be '123'
    const userId=req.params.id;
    //call the service layer to search for this user in our database
    const user=userService.getUserById(userId);

    //handle the case where the user is not found
    if(!user){
        //returns 404 not found with json error message
        return res.status(404).json({error: "User not found"});
    
    }
    // Handle the success case
    // Return 200 OK along with the user object as JSON
    res.status(200).json(user);
}
module.exports = {
    registerUser,
    getUser
};