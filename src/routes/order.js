const express = require('express');
const router = express.Router();

const orderController = require('../controllers/order');

// authMiddleware protects order history.
// optionalAuthMiddleware allows guest checkout but detects logged-in users.
const {
    authMiddleware,
    optionalAuthMiddleware
} = require('../middleware/authMiddleware');

// Create order
// Guests can checkout without token.
// Logged-in users will have req.user attached if they send a valid token.
router.post('/', optionalAuthMiddleware, orderController.createOrder);

// Get all orders for the logged-in user
router.get('/', authMiddleware, orderController.getOrders);

// Get a specific order by ID
router.get('/:id', authMiddleware, orderController.getOrderById);

// Update a specific order by ID
router.patch('/:id', authMiddleware, orderController.updateOrder);

// Delete a specific order by ID
router.delete('/:id', authMiddleware, orderController.deleteOrder);

module.exports = router;