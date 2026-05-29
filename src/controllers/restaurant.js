const restaurantService = require('../services/restaurant');

/**
 * dealing with the request: GET /api/restaurants
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
 * dealing with the request: POST /api/restaurants
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

/**
 * dealing with the request: GET /api/restaurants/:id
 * returns a restaurant by ID
 */
const getRestaurantById = (req, res) => {
    try {
        const restaurant = restaurantService.getRestaurantById(req.params.id);
        return res.status(200).json(restaurant);
    } catch (error) {
        if (error.message === "Not Found") {
            return res.status(404).json({ error: "Not Found" });
        }
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * dealing with the request: PATCH /api/restaurants/:id
 * updating feilds of an existing restaurant
 */
const updateRestaurant = (req, res) => {
    try {
        const updated = restaurantService.updateRestaurant(req.params.id, req.body);
        return res.status(200).json(updated);
    } catch (error) {
        if (error.message === "Not Found") {
            return res.status(404).json({ error: "Not Found" });
        }
        return res.status(400).json({ error: error.message });
    }
};

/**
 * dealing with the request: DELETE /api/restaurants/:id
 * deleting a restaurant from the system
 */
const deleteRestaurant = (req, res) => {
    try {
        restaurantService.deleteRestaurant(req.params.id);
        return res.status(200).json({ success: true });
    } catch (error) {
        if (error.message === "Not Found") {
            return res.status(404).json({ error: "Not Found" });
        }
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = {
    getRestaurants,
    createRestaurant,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant
};