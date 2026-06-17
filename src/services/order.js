// Import the Mongoose model instead of using an in-memory array
// Make sure the path exactly matches your model's filename
const Order = require('../models/order'); 

// Create a new order and link it to a specific user
const createOrder = async (userId, orderData) => {
    // Create a new document instance using the Mongoose model
    const newOrder = new Order({
        userId: userId, 
        ...orderData
    });
    
    // Save the document to the MongoDB database and return it
    return await newOrder.save();
};

// Fetch all orders that belong to a specific user
const getOrdersByUserId = async (userId) => {
    // Mongoose finds all documents matching the provided userId
    return await Order.find({ userId: userId });
};

// Fetch a specific order by its ID
const getOrderById = async (orderId) => {
    // Retrieve a single document by its MongoDB ObjectId
    return await Order.findById(orderId);
};

// Update a specific order's data
const updateOrder = async (orderId, updateData) => {
    // We extract id and userId from updateData to prevent them from being overwritten accidentally
    const { id, userId, ...safeData } = updateData;
    
    // Find the document by ID and update it directly in the database
    // { new: true } ensures we return the updated document, not the old one
    return await Order.findByIdAndUpdate(orderId, safeData, { new: true });
};

// Delete a specific order from the database
const deleteOrder = async (orderId) => {
    // Find the document by ID and remove it from MongoDB
    const result = await Order.findByIdAndDelete(orderId);
    
    // Return true if a document was actually found and deleted
    return result !== null; 
};

module.exports = {
    createOrder,
    getOrdersByUserId,
    getOrderById,
    updateOrder,
    deleteOrder
};