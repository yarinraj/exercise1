//import both services :order for data ' user for authentication
const orderService = require('../services/order');
const userService = require('../services/user');
//create new order
const createOrder = (req,res)=>{
    //Extract the token from the headers (Express automatically lowercases header names)
    const token = req.headers.authorization;
    // Check if token exists
    if (!token) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    // Verify the user exists in our system
    const user = userService.getUserById(token);
    if (!user) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }

    // If we reached here, the user is authenticated!
    // Create the order using the data from the request body and the user's ID
    const orderData = req.body;
    const newOrder = orderService.createOrder(user.id, orderData);

    // Return the newly created order with a 201 Created status (Standard for successful creation)
    res.status(201).json(newOrder);
};

// Get all orders for the logged-in user
const getOrders = (req, res) => {
    // Extract the token from the headers
    const token = req.headers.authorization;

    // Check if token exists
    if (!token) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    // Verify the user exists
    const user = userService.getUserById(token);
    if (!user) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }

    // Fetch only the orders that belong to this specific user
    const userOrders = orderService.getOrdersByUserId(user.id);
    
    // Return the array of orders
    res.status(200).json(userOrders);
};

module.exports = {
    createOrder,
    getOrders
};

