const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },

    restaurantName: {
        type: String,
        required: true
    },

    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        name: {
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
    timestamps: true
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

module.exports = Order;