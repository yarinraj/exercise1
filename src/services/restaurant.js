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

module.exports = {
    getAllRestaurants,
    createRestaurant
};