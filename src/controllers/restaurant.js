const restaurantService = require('../services/restaurant');
const cppGateway = require('../services/cppGateway');
const userService = require('../services/user');
/**
 * dealing with the request: GET /api/restaurants
 * returns all the resturants with status 200 OK
 */
const getRestaurants = (req, res) => {
    try {
        const restaurants = restaurantService.getAllRestaurants();
        return res.status(200).json(restaurants);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * dealing with the request: POST /api/restaurants
 * creating new resturant and returns it with status 201 Created
 */
const createRestaurant = (req, res) => {
    try {
        const newRestaurant = restaurantService.createRestaurant(req.body);
        
        return res.status(201).json(newRestaurant);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

/**
 * dealing with the request: GET /api/restaurants/:id
 * returns a restaurant by ID
 */
const getRestaurantById = (req, res) => {
    try {
        const restaurant = restaurantService.getRestaurantById(req.params.id);
        return res.status(200).json(restaurant);
    } catch (error) {
        if (error.message === "Not Found") {
            return res.status(404).json({ error: "Not Found" });
        }
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * dealing with the request: PATCH /api/restaurants/:id
 * updating feilds of an existing restaurant
 */
const updateRestaurant = (req, res) => {
    try {
        const updated = restaurantService.updateRestaurant(req.params.id, req.body);
        return res.status(200).json(updated);
    } catch (error) {
        if (error.message === "Not Found") {
            return res.status(404).json({ error: "Not Found" });
        }
        return res.status(400).json({ error: error.message });
    }
};

/**
 * dealing with the request: DELETE /api/restaurants/:id
 * deleting a restaurant from the system
 */
const deleteRestaurant = (req, res) => {
    try {
        restaurantService.deleteRestaurant(req.params.id);
        return res.status(200).json({ success: true });
    } catch (error) {
        if (error.message === "Not Found") {
            return res.status(404).json({ error: "Not Found" });
        }
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * dealing with the request: GET /api/restaurants/:id/products
 * returns the product array (the menu) of a specific restaurant
 */
const getRestaurantProducts = (req, res) => {
    try {
        const products = restaurantService.getRestaurantProducts(req.params.id);
        return res.status(200).json(products);
    } catch (error) {
        if (error.message === "Not Found") {
            return res.status(404).json({ error: "Not Found" });
        }
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * dealing with the request: POST/api/restaurants/:id/products
 * adds a new product to the specific restaurant's menu
 */
const createProduct = (req, res) => {
    try {
        const newProduct = restaurantService.addProductToRestaurant(req.params.id, req.body);
        return res.status(201).json(newProduct);
    } catch (error) {
        if (error.message === "Not Found") {
            return res.status(404).json({ error: "Not Found" });
        }
        return res.status(400).json({ error: error.message });
    }
};

/**
 * dealing with the request: GET /api/restaurants/:id/products/:pid
 * returns a specific product from a specific restaurant 
 */
const getProductById = async (req, res) => {
    const restaurantId = req.params.id;
    const productId = req.params.pid;

    try {
        // getting the product details from the service
        const product = restaurantService.getProductFromRestaurant(restaurantId, productId);

        // 2. gateway interaction - sending a view interaction to the C++ server
        try {
            const token = req.headers.authorization;
            if (token) {
                const user = userService.getUserById(token);
                if (user) {
                    console.log(`[Gateway] Sending GET interaction for User: ${user.id}, Product: ${productId}`);
                    await cppGateway.sendGetInteraction(user.id, productId);
                }
            } else {
                console.log(`[Gateway Warning] No authorization token provided, skipping C++ sync.`);
            }
        } catch (cppError) {
            console.error("[Gateway Error] Could not sync view interaction with C++ server:", cppError.message);
        }

        // successfully retrieved the product, returning it in the response
        return res.status(200).json(product);

    } catch (error) {
        if (error.message === "Not Found") {
            return res.status(404).json({ error: "Product Not Found" });
        }
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * dealing with the request: PATCH /api/restaurants/:id/products/:pid
 * updating a specific product on the menu
 */
const updateProduct = async (req, res) => {
    const restaurantId = req.params.id;
    const productId = req.params.pid;

    try {
        // updating the product details in the service
        const updated = restaurantService.updateRestaurantProduct(restaurantId, productId, req.body);
        
        // 2. gateway interaction - sending an update interaction to the C++ server
        try {
            const token = req.headers.authorization;
            if (token) {
                const user = userService.getUserById(token);
                if (user) {
                    console.log(`[Gateway] Sending POST interaction for User: ${user.id}, Product: ${productId}`);
                    await cppGateway.sendPostInteraction(user.id, productId); 
                }
            }
        } catch (cppError) {
            console.error("[Gateway Error] Could not sync update interaction with C++ server:", cppError.message);
        }

        return res.status(204).json(updated);
    } catch (error) {
        if (error.message === "Not Found") {
            return res.status(404).json({ error: "Product Not Found" });
        }
        return res.status(400).json({ error: error.message });
    }
};

/**
 * dealing with the request: DELETE /api/restaurants/:id/products/:pid
 * deleteing a specific product from a restaurant's menu
 */
const deleteProduct = async (req, res) => {
    const restaurantId = req.params.id;
    const productId = req.params.pid;

    try {
        // deleting the product from the restaurant's menu in the service
        restaurantService.deleteRestaurantProduct(restaurantId, productId);
        
        // 2. gateway interaction - sending a delete interaction to the C++ server
        try {
            const token = req.headers.authorization;
            if (token) {
                const user = userService.getUserById(token);
                if (user) {
                    console.log(`[Gateway] Sending DELETE interaction for User: ${user.id}, Product: ${productId}`);
                    await cppGateway.deleteOrderInteraction(user.id, productId);
                }
            }
        } catch (cppError) {
            console.error("[Gateway Error] Could not sync delete interaction with C++ server:", cppError.message);
        }

        return res.status(204).json({ success: true });
    } catch (error) {
        if (error.message === "Not Found") {
            return res.status(404).json({ error: "Product Not Found" });
        }
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = {
    getRestaurants,
    createRestaurant,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant,
    getRestaurantProducts,
    createProduct,
    getProductById,
    updateProduct,
    deleteProduct
};