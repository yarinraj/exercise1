const express = require('express');
const router = express.Router();

const restaurantController = require('../controllers/restaurant');

// route for getting all the restaurants: GET/api/restaurants
router.get('/', restaurantController.getRestaurants);

// route for creating new restaurant: POST/api/restaurants
router.post('/', restaurantController.createRestaurant);

// route for getting a specific restaurant: GET/api/restaurants/:id
router.get('/:id', restaurantController.getRestaurantById);

// route for updating a specific restaurant: PATCH/api/restaurants/:id
router.patch('/:id', restaurantController.updateRestaurant);

// route for deleting a specific restaurant: DELETE/api/restaurants/:id
router.delete('/:id', restaurantController.deleteRestaurant);

module.exports = router;