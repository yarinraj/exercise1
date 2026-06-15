const Restaurant = require('../models/restaurant');

// Getting all the restaurants
const getAllRestaurants = async () => {
    return await Restaurant.find();
};

// Creating a new restaurant, attaching the ownerId
const createRestaurant = async (restaurantData, ownerId) => {
    if (!restaurantData || !restaurantData.name || restaurantData.name.trim() === "") {
        throw new Error("Name is required");
    }
    
    const newRestaurant = new Restaurant({
        ...restaurantData,
        ownerId
    });
    
    return await newRestaurant.save();
};

// Getting a restaurant by ID
const getRestaurantById = async (id) => {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
        throw new Error("Not Found");
    }
    return restaurant;
};

// Updating a restaurant - strictly requires ownerId
const updateRestaurant = async (id, updatedData, ownerId) => {
    if (!updatedData) {
        throw new Error("Invalid data");
    }
    
    // findOneAndUpdate with ownerId ensures only the creator can edit
    const restaurant = await Restaurant.findOneAndUpdate(
        { _id: id, ownerId: ownerId },
        updatedData,
        { new: true } // Returns the updated document
    );
    
    if (!restaurant) {
        throw new Error("Not Found or Unauthorized");
    }
    return restaurant;
};

// Deleting a restaurant - strictly requires ownerId
const deleteRestaurant = async (id, ownerId) => {
    const isDeleted = await Restaurant.findOneAndDelete({ _id: id, ownerId: ownerId });
    if (!isDeleted) {
        throw new Error("Not Found or Unauthorized");
    }
    return true;
};

// Getting the menu (products) of a restaurant
const getRestaurantProducts = async (restaurantId) => {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
        throw new Error("Not Found");
    }
    return restaurant.products;
};

// Adding a product to a restaurant - strictly requires ownerId
const addProductToRestaurant = async (restaurantId, productData, ownerId) => {
    if (!productData || !productData.name) {
        throw new Error("Invalid product data");
    }

    const restaurant = await Restaurant.findOne({ _id: restaurantId, ownerId: ownerId });
    if (!restaurant) {
        throw new Error("Not Found or Unauthorized");
    }

    restaurant.products.push(productData);
    await restaurant.save();
    
    // Return the newly added product (the last one in the array)
    return restaurant.products[restaurant.products.length - 1];
};

// Getting a specific product from a specific restaurant
const getProductFromRestaurant = async (restaurantId, productId) => {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
        throw new Error("Not Found");
    }
    
    // Mongoose allows searching subdocuments by ID
    const product = restaurant.products.id(productId);
    if (!product) {
        throw new Error("Not Found");
    }
    return product;
};

// Updating a specific product - strictly requires ownerId
const updateRestaurantProduct = async (restaurantId, productId, updatedProductData, ownerId) => {
    const restaurant = await Restaurant.findOne({ _id: restaurantId, ownerId: ownerId });
    if (!restaurant) {
        throw new Error("Not Found or Unauthorized");
    }

    const product = restaurant.products.id(productId);
    if (!product) {
        throw new Error("Not Found");
    }

    // Update product fields
    Object.assign(product, updatedProductData);
    await restaurant.save();
    return product;
};

// Deleting a specific product - strictly requires ownerId
const deleteRestaurantProduct = async (restaurantId, productId, ownerId) => {
    const restaurant = await Restaurant.findOne({ _id: restaurantId, ownerId: ownerId });
    if (!restaurant) {
        throw new Error("Not Found or Unauthorized");
    }

    const product = restaurant.products.id(productId);
    if (!product) {
        throw new Error("Not Found");
    }

    // Remove the subdocument
    product.deleteOne();
    await restaurant.save();
    return true;
};

// Search function across restaurants and products
const search = async (query) => {
    const regex = new RegExp(query, 'i'); // Case insensitive regex
    
    // Find all restaurants where either the restaurant or its products match the query
    const dbRestaurants = await Restaurant.find({
        $or: [
            { name: regex },
            { description: regex },
            { 'products.name': regex },
            { 'products.description': regex }
        ]
    });

    const results = { 
        restaurants: [],
        products: []
    };
    
    const lowerCaseQuery = query.toLowerCase();

    // Reconstruct the exact return structure the frontend expects
    dbRestaurants.forEach(restaurant => {
        const matchRestaurantName = restaurant.name?.toLowerCase().includes(lowerCaseQuery);
        const matchRestaurantDesc = restaurant.description?.toLowerCase().includes(lowerCaseQuery);
        
        if (matchRestaurantName || matchRestaurantDesc) {
            results.restaurants.push(restaurant);
        }
        
        if (restaurant.products && Array.isArray(restaurant.products)) {
            restaurant.products.forEach(product => {
                const matchProductName = product.name?.toLowerCase().includes(lowerCaseQuery);
                const matchProductDesc = product.description?.toLowerCase().includes(lowerCaseQuery);

                if (matchProductName || matchProductDesc) {
                    results.products.push(product);
                }
            });
        }
    });

    return results;
};

module.exports = {
    getAllRestaurants,
    createRestaurant,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant,
    getRestaurantProducts,
    addProductToRestaurant,
    getProductFromRestaurant,
    updateRestaurantProduct,
    deleteRestaurantProduct,
    search 
};