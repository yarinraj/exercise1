const express = require('express');
const router = express.Router();

// Import the order controller we just created
const orderController = require('../controllers/order');

// Route to handle creating a new order (POST)
router.post('/', orderController.createOrder);

// Route to handle fetching all orders for the logged-in user (GET)
router.get('/', orderController.getOrders);

module.exports = router;