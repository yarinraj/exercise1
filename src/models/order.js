const mongoose = require('mongoose');

// Define the Order Schema
const orderSchema = new mongoose.Schema({
    userId: {
        type: String, // This links the order to the user who made it
        required: true
    },
    restaurantId: {
        type: String, // Links the order to the specific restaurant
        required: true
    },
    products: [{
        productId: { 
            type: String, 
            required: true 
        },
        quantity: { 
            type: Number, 
            required: true,
            min: 1
        },
        price: { 
            type: Number, 
            required: true 
        }
    }],
    status: {
        type: String,
        enum: ['pending', 'preparing', 'delivered', 'cancelled'],
        default: 'pending'
    }
}, { 
    // Automatically adds 'createdAt' and 'updatedAt' timestamps
    timestamps: true 
});

// Create and export the model securely
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

module.exports = Order;