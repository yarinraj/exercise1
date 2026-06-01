const { v4: uuidv4 } = require('uuid');

// In-memory array to store all orders in the system
const orders = [];

// Create a new order and link it to a specific user
const createOrder = (userId, orderData) => {
    const newOrder = {
        id: uuidv4(),
        userId: userId, // We save the user's ID inside the order to know who it belongs to
        ...orderData
    };
    
    orders.push(newOrder);
    return newOrder;
};

// Fetch all orders that belong to a specific user
const getOrdersByUserId = (userId) => {
    // We use .filter() because a user might have multiple orders.
    // It returns an array of all orders where the 'userId' matches.
    return orders.filter(order => order.userId === userId);
};

module.exports = {
    createOrder,
    getOrdersByUserId,
    orders
};