const express = require('express');
const router = express.Router();

// Import the order controller we just created
const orderController = require('../controllers/order');

// Route to handle creating a new order (POST)
router.post('/', orderController.createOrder);

// Route to handle fetching all orders for the logged-in user (GET)
router.get('/:id', orderController.getOrders);
// Route to update a specific order by ID (PATCH)
router.patch('/:id', orderController.updateOrder);
// Route to delete a specific order by ID (delete)
router.delete('/:id', orderController.deleteOrder);
module.exports = router;