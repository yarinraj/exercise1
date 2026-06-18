// Import services for data, authentication, and validation
const orderService = require('../services/order');
const restaurantService = require('../services/restaurant');
const cppGateway = require('../services/cppGateway');

/**
 * Create a new order
 * Supports both authenticated users (req.user exists) and guest users
 */
const createOrder = async (req, res) => {
    const userId = req.user?.userId
        ? req.user.userId.toString()
        : `guest_user_${Date.now()}`;

    const { restaurantId, products } = req.body;

    try {
        if (!restaurantId) {
            return res.status(400).json({ error: "Restaurant ID is required" });
        }

        const restaurant = await restaurantService.getRestaurantById(restaurantId);

        if (!products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ error: "Products array is required and cannot be empty" });
        }

        const orderProducts = [];

        for (const item of products) {
            const productId = item.id || item.productId;

            const product = await restaurantService.getProductFromRestaurant(
                restaurantId,
                productId
            );

            orderProducts.push({
                productId: product._id.toString(),
                name: product.name,
                quantity: item.quantity,
                price: product.price
            });
        }

        const orderData = {
            restaurantId,
            restaurantName: restaurant.name,
            products: orderProducts
        };

        const newOrder = await orderService.createOrder(userId, orderData);

        try {
            await cppGateway.sendPostInteraction(userId, orderProducts);
        } catch (cppError) {
            console.error("Warning: Could not sync order with C++ server:", cppError.message);
        }

        res.set('Location', `/api/orders/${newOrder.id || newOrder._id}`);
        return res.status(201).json(newOrder);

    } catch (error) {
        if (error.message === "Not Found") {
            return res.status(404).json({ error: "Restaurant or product not found" });
        }

        return res.status(400).json({ error: error.message });
    }
};
/**
 * Get all orders for the authenticated user
 */
const getOrders = async (req, res) => {
    const user = req.user;
    const userOrders = await orderService.getOrdersByUserId(user.userId);
    res.status(200).json(userOrders);
};

/**
 * Get a specific order by its ID
 */
const getOrderById = async (req, res) => {
    const user = req.user;
    const orderId = req.params.id;
    const order = await orderService.getOrderById(orderId);

    if (!order) return res.status(404).json({ error: "Order not found" });

    // Security check: Ensure the order belongs to the requester
    if (order.userId !== user.userId) return res.status(403).json({ error: "Forbidden: Access denied" });

    res.status(200).json(order);
};

/**
 * Update a specific order
 */
const updateOrder = async (req, res) => {
    const user = req.user;
    const orderId = req.params.id;
    const order = await orderService.getOrderById(orderId);

    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.userId !== user.userId) return res.status(403).json({ error: "Forbidden: Access denied" });

    await orderService.updateOrder(orderId, req.body);
    res.status(204).send();
};

/**
 * Delete a specific order 
 */
const deleteOrder = async (req, res) => {
    const user = req.user;
    const orderId = req.params.id;
    const order = await orderService.getOrderById(orderId);

    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.userId !== user.userId) return res.status(403).json({ error: "Forbidden: Access denied" });

    try {
        await cppGateway.deleteOrderInteraction(user.userId, order.products);
    } catch (cppError) {
        console.error("Warning: Could not sync deletion with C++ server:", cppError.message);
    }

    await orderService.deleteOrder(orderId);
    res.status(204).send();
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrder,
    deleteOrder
};