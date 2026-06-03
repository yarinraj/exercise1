const Restaurant = require('../models/restaurant');

/**
 * getting all the resturants
 */
const getAllRestaurants = () => {
    return Restaurant.getAll();
};

/**
 * @param {Object} restaurantData - the data from the request
 */
const createRestaurant = (restaurantData) => {
    if (!restaurantData || !restaurantData.name || restaurantData.name.trim() === "") {
        throw new Error("Name is required");
    }
    
    // data is valid -> sending the data to the model so it'll make the object with the id
    return Restaurant.create(restaurantData);
};

// getting a resturant by ID
const getRestaurantById = (id) => {
    const restaurant = Restaurant.getById(id);
    if (!restaurant) {
        throw new Error("Not Found");
    }
    return restaurant;
};

// updating restaurant
const updateRestaurant = (id, updatedData) => {
    if (!updatedData) {
        throw new Error("Invalid data");
    }
    const restaurant = Restaurant.update(id, updatedData);
    if (!restaurant) {
        throw new Error("Not Found");
    }
    return restaurant;
};

// deleting restaurant
const deleteRestaurant = (id) => {
    const isDeleted = Restaurant.remove(id);
    if (!isDeleted) {
        throw new Error("Not Found");
    }
    return true;
};

// getting a menu of a restaurant
const getRestaurantProducts = (restaurantId) => {
    const products = Restaurant.getProducts(restaurantId);
    if (!products) {
        throw new Error("Not Found");
    }
    return products;
};

// adding a product to a restaurant
const addProductToRestaurant = (restaurantId, productData) => {
    if (!productData || !productData.name) {
        throw new Error("Invalid product data");
    }

    const newProduct = Restaurant.addProduct(restaurantId, productData);
    if (!newProduct) {
        throw new Error("Not Found");
    }
    return newProduct;
};

// getting a specific product from a specific restaurant
const getProductFromRestaurant = (restaurantId, productId) => {
    const product = Restaurant.getProductById(restaurantId, productId);
    if (!product) {
        throw new Error("Not Found");
    }
    return product;
};

// updating a specific product from a specific restaurant
const updateRestaurantProduct = (restaurantId, productId, updatedProductData) => {
    const updatedProduct = Restaurant.updateProduct(restaurantId, productId, updatedProductData);
    if (!updatedProduct) {
        throw new Error("Not Found");
    }
    return updatedProduct;
};

// deleting a specific product from a specific restaurant
const deleteRestaurantProduct = (restaurantId, productId) => {
    const isDeleted = Restaurant.removeProduct(restaurantId, productId);
    if (!isDeleted) {
        throw new Error("Not Found");
    }
    return true;
};
//search func 
const search = (query) => {
    return Restaurant.search(query); 
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