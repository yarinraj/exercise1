const express = require('express');
const router = express.Router();

// Import the order controller we just created
const orderController = require('../controllers/order');
// Import the auth middleware to protect these routes
const { authMiddleware, isOwner } = require('../middleware/authMiddleware');
// Route to handle creating a new order (POST)
router.post('/',authMiddleware, orderController.createOrder);


// Route to handle fetching all orders for the logged-in user (GET)
router.get('/',authMiddleware, orderController.getOrders);
// Route to fetch a specific order by its ID
router.get('/:id',authMiddleware, orderController.getOrderById);
// Route to update a specific order by ID (PATCH)
router.patch('/:id',authMiddleware, orderController.updateOrder);
// Route to delete a specific order by ID (delete)
router.delete('/:id',authMiddleware, orderController.deleteOrder);
module.exports = router;