const mongoose = require('mongoose');

// Schema for a single product/dish (Nested Schema)
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
});

// Schema for the restaurant
const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    cuisine: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    lat: {
        type: Number
    },
    lng: {
        type: Number
    },
    isPromoted: {
        type: Boolean,
        default: false
    },
    // Critical field: references the user who created the restaurant
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Array of products based on the nested schema defined above
    products: [productSchema]
}, { timestamps: true });

const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;