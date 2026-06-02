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
// Fetch a specific order by its ID
const getOrderById = (orderId) => {
    return orders.find(order => order.id === orderId);
};

// Update a specific order's data
const updateOrder = (orderId, updateData) => {
    const order = getOrderById(orderId);
    if (order) {
        // We extract id and userId from updateData to prevent them from being overwritten accidentally
        const { id, userId, ...safeData } = updateData;
        
        // Update the existing order object with the new safe data
        Object.assign(order, safeData);
    }
    return order;
};

// Delete a specific order from the array
const deleteOrder = (orderId) => {
    const index = orders.findIndex(order => order.id === orderId);
    if (index !== -1) {
        // Remove 1 item at the found index
        orders.splice(index, 1);
        return true;
    }
    return false;
};

module.exports = {
    createOrder,
    getOrdersByUserId,
    getOrderById,
    updateOrder,
    deleteOrder,
    orders
};