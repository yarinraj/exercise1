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

// route for getting the menu of a specific restaurant: GET/api/restaurants/:id/products
router.get('/:id/products', restaurantController.getRestaurantProducts);

// route for adding a product to the menu of a specific restaurant: POST/api/restaurants/:id/products
router.post('/:id/products', restaurantController.createProduct);

// route for getting a specific product in a specific restaurant's menu: GET/api/restaurants/:id/products/:pid
router.get('/:id/products/:pid', restaurantController.getProductById);

// route for updating a specific product in a specific restaurant's menu: PATCH/api/restaurants/:id/products/:pid
router.patch('/:id/products/:pid', restaurantController.updateProduct);

// route for deleting a specific product in a specific restaurant's menu: DELETE/api/restaurants/:id/products/:pid
router.delete('/:id/products/:pid', restaurantController.deleteProduct);

module.exports = router;