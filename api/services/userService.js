// Import the service layer to handle business logic and data storage
const userService = require('../services/userService');

const registerUser = (req,res)=>{
    //extract user data from the request body
    const {username, password, adress, phone }= req.body;
    // basic validation: ensure mendatory fields are provided
    if(!username||!password){
        return res.status(400).json({error: "Username and password are required"});
    }

    //pass the data to the service layer to create and save the new user
    const newUser = userService.createUser({username,password, adress, phone});

    //return the success response 201 created along with the newly created user object
    res.status(201).json(newUser);
}