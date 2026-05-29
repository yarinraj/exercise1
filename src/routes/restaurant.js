const express = require('express');
const router = express.Router();

const restaurantController = require('../controllers/restaurant');

// route for getting all the restaurants: GET/api/restaurants
router.get('/', restaurantController.getRestaurants);

// route for creating new restaurant: POST/api/restaurants
router.post('/', restaurantController.createRestaurant);

module.exports = router;