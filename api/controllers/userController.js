// Import the service layer to handle business logic and data storage
const userService = require('../services/userService');

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
module.exports = {
    registerUser
};