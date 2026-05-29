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

module.exports = {
    getAllRestaurants,
    createRestaurant,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant
};