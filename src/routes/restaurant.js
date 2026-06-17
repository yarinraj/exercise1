const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurant');

// Import the authentication and authorization middlewares
const { authMiddleware, isOwner } = require('../middleware/authMiddleware');

// Route for getting all the restaurants: GET /api/restaurants
// Public route
router.get('/', restaurantController.getRestaurants);

// Route for creating new restaurant: POST /api/restaurants
// Protected route: Only authenticated owners can create a restaurant
router.post('/', authMiddleware, isOwner, restaurantController.createRestaurant);

// IMPORTANT: specific routes must come before /:id routes
// Route for getting restaurants owned by the logged-in owner
router.get(
  '/my-restaurants',
  authMiddleware,
  isOwner,
  restaurantController.getMyRestaurants
);

// Route for searching across restaurants and products
router.get('/search/:query', restaurantController.searchItems);

// Route for getting a specific restaurant: GET /api/restaurants/:id
// Public route
router.get('/:id', restaurantController.getRestaurantById);

// Route for updating a specific restaurant: PATCH /api/restaurants/:id
// Protected route: Only authenticated owners can update
router.patch('/:id', authMiddleware, isOwner, restaurantController.updateRestaurant);

// Route for deleting a specific restaurant: DELETE /api/restaurants/:id
// Protected route: Only authenticated owners can delete
router.delete('/:id', authMiddleware, isOwner, restaurantController.deleteRestaurant);

// Route for getting the menu of a specific restaurant: GET /api/restaurants/:id/products
// Public route
router.get('/:id/products', restaurantController.getRestaurantProducts);

// Route for adding a product to the menu of a specific restaurant: POST /api/restaurants/:id/products
// Protected route: Only authenticated owners can add products
router.post('/:id/products', authMiddleware, isOwner, restaurantController.createProduct);

// Route for getting a specific product in a specific restaurant's menu: GET /api/restaurants/:id/products/:pid
// Public route
router.get('/:id/products/:pid', restaurantController.getProductById);

// Route for updating a specific product in a specific restaurant's menu: PATCH /api/restaurants/:id/products/:pid
// Protected route: Only authenticated owners can update products
router.patch('/:id/products/:pid', authMiddleware, isOwner, restaurantController.updateProduct);

// Route for deleting a specific product in a specific restaurant's menu: DELETE /api/restaurants/:id/products/:pid
// Protected route: Only authenticated owners can delete products
router.delete('/:id/products/:pid', authMiddleware, isOwner, restaurantController.deleteProduct);

module.exports = router;