// Import services for data, authentication, and validation
const orderService = require('../services/order');
const userService = require('../services/user');
const restaurantService = require('../services/restaurant');
const cppGateway = require('../services/cppGateway');

// Create a new order
const createOrder = async (req, res) => {
    // Extract the token from the headers
    const token = req.headers.authorization;

    // Check if token exists
    if (!token) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    // Verify the user exists in our system
    const user = userService.getUserById(token);
    if (!user) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }

    // Extract restaurant and products from the request body
    const { restaurantId, products } = req.body;

    try {
        // 1. Check if restaurant ID is provided and exists in the system
        if (!restaurantId) {
            return res.status(400).json({ error: "Restaurant ID is required" });
        }
        restaurantService.getRestaurantById(restaurantId);

        // 2. Validate that the products array is provided and not empty
        if (!products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ error: "Products array is required and cannot be empty" });
        }

        // 3. Verify each product exists in the specified restaurant's menu
        for (const item of products) {
            const productId = item.id || item.productId;
            restaurantService.getProductFromRestaurant(restaurantId, productId);
        }

    } catch (error) {
        // If the restaurant or product is not found, return 404 Not Found
        if (error.message === "Not Found") {
            return res.status(404).json({ error: "Restaurant or product not found" });
        }
        return res.status(400).json({ error: error.message });
    }

    // If everything is valid, create the order
    const newOrder = orderService.createOrder(user.id, req.body);
    
    // Gateway communication to update the C++ server about the new order interaction
    try {
        await cppGateway.sendPostInteraction(user.id, req.body.products);
    } catch (cppError) {
        console.error("Warning: Could not sync order with C++ server:", cppError.message);
    }
    
    // Return the newly created order with a 201 Created status
    res.set('Location', `/api/orders/${newOrder.id}`);
    return res.status(201).json(newOrder);
};

// Get all orders for the logged-in user
const getOrders = (req, res) => {
    // Extract the token from the headers
    const token = req.headers.authorization;

    // Check if token exists
    if (!token) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    // Verify the user exists
    const user = userService.getUserById(token);
    if (!user) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }

    // Fetch only the orders that belong to this specific user
    const userOrders = orderService.getOrdersByUserId(user.id);

    // Return the array of orders
    res.status(200).json(userOrders);
};

// Get a specific order by its ID
const getOrderById = (req, res) => {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: "Unauthorized: No token provided" });

    const user = userService.getUserById(token);
    if (!user) return res.status(401).json({ error: "Unauthorized: Invalid token" });

    const orderId = req.params.id;
    const order = orderService.getOrderById(orderId);

    if (!order) return res.status(404).json({ error: "Order not found" });

    // Security check: Ensure the order belongs to the requester
    if (order.userId !== user.id) return res.status(403).json({ error: "Forbidden: Access denied to this order" });

    res.status(200).json(order);
};

// Update a specific order
const updateOrder = (req, res) => {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: "Unauthorized: No token provided" });

    const user = userService.getUserById(token);
    if (!user) return res.status(401).json({ error: "Unauthorized: Invalid token" });

    const orderId = req.params.id;
    const order = orderService.getOrderById(orderId);

    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.userId !== user.id) return res.status(403).json({ error: "Forbidden: Access denied to this order" });

    // Update the order via the service layer
    const updatedOrder = orderService.updateOrder(orderId, req.body);
    res.status(204).send();
};

// Delete a specific order 
const deleteOrder = async (req, res) => {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: "Unauthorized: No token provided" });

    const user = userService.getUserById(token);
    if (!user) return res.status(401).json({ error: "Unauthorized: Invalid token" });

    const orderId = req.params.id;
    const order = orderService.getOrderById(orderId);

    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.userId !== user.id) return res.status(403).json({ error: "Forbidden: Access denied to this order" });
    
    // Gateway communication to update the C++ server about the deleted order interaction
    try {
        // order.products contains the product array of the order being deleted
        await cppGateway.deleteOrderInteraction(user.id, order.products);
    } catch (cppError) {
        console.error("Warning: Could not sync deletion with C++ server:", cppError.message);
    }
    // Delete the order via the service layer
    orderService.deleteOrder(orderId);
    res.status(204).send();
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrder,
    deleteOrder
};