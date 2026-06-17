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
    },
    image: {
        type: String,
        required: false, // Optional field
        trim: true,
        validate: {
            validator: function(v) {
                // Only validate if the user actually provided a URL
                return !v || /^(https?:\/\/)/.test(v);
            },
            message: props => `${props.value} is not a valid image URL!`
        }
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
    image: {              
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
        type: Number,
        required: true // Now strictly required
    },
    lng: {
        type: Number,
        required: true // Now strictly required
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