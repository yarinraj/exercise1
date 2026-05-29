const restaurantService = require('../services/restaurant');

/**
 * GET /api/restaurants
 * returns all the resturants with status 200 OK
 */
const getRestaurants = (req, res) => {
    try {
        const restaurants = restaurantService.getAllRestaurants();
        return res.status(200).json(restaurants);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * POST /api/restaurants
 * creating new resturant and returns it with status 201 Created
 */
const createRestaurant = (req, res) => {
    try {
        const newRestaurant = restaurantService.createRestaurant(req.body);
        
        return res.status(201).json(newRestaurant);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

module.exports = {
    getRestaurants,
    createRestaurant
};