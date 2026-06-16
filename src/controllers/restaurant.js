const restaurantService = require('../services/restaurant');
const cppGateway = require('../services/cppGateway');
const Restaurant = require('../models/restaurant');
const userService = require('../services/user');


/**
 * Dealing with the request: GET /api/restaurants
 * Returns all the restaurants with status 200 OK
 */
const getRestaurants = async (req, res) => {
    try {
        const restaurants = await restaurantService.getAllRestaurants();
        return res.status(200).json(restaurants);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * Dealing with the request: POST /api/restaurants
 * Creating a new restaurant and returning it with status 201 Created
 */
const createRestaurant = async (req, res) => {
    try {
        // Extract the user ID from the decoded JWT (placed there by authMiddleware)
        const ownerId = req.user.userId; 
        
        const newRestaurant = await restaurantService.createRestaurant(req.body, ownerId);
        res.set('Location', `/api/restaurants/${newRestaurant._id}`);
        return res.status(201).json(newRestaurant);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

/**
 * Dealing with the request: GET /api/restaurants/:id
 * Returns a restaurant by ID
 */
const getRestaurantById = async (req, res) => {
    try {
        const restaurant = await restaurantService.getRestaurantById(req.params.id);
        return res.status(200).json(restaurant);
    } catch (error) {
        if (error.message === "Not Found") {
            return res.status(404).json({ error: "Not Found" });
        }
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * Dealing with the request: PATCH /api/restaurants/:id
 * Updating fields of an existing restaurant
 */
const updateRestaurant = async (req, res) => {
    console.log("User ID from token:", req.user);
    try {
        const { phone } = req.body;
        // Phone number validation        
        if (phone) {
            const isNumeric = /^\d+$/.test(phone);
            if (!isNumeric || phone.length > 10) {
                return res.status(400).json({ error: "Phone must contain only numbers and be up to 10 digits long" });
            }
        }
        
        // Extract ownerId to ensure only the creator can update
        const ownerId = req.user.userId;
        const updated = await restaurantService.updateRestaurant(req.params.id, req.body, ownerId);
        
        return res.status(204).send();
    } catch (error) {
        if (error.message === "Not Found or Unauthorized") {
            return res.status(403).json({ error: "Not Found or you do not have permission to edit this restaurant." });
        }
        return res.status(400).json({ error: error.message });
    }
};

/**
 * Dealing with the request: DELETE /api/restaurants/:id
 * Deleting a restaurant from the system
 */
const deleteRestaurant = async (req, res) => {
    try {
        const ownerId = req.user.userId;
        await restaurantService.deleteRestaurant(req.params.id, ownerId);
        return res.status(204).send();
    } catch (error) {
        if (error.message === "Not Found or Unauthorized") {
            return res.status(403).json({ error: "Not Found or you do not have permission to delete this restaurant." });
        }
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * Dealing with the request: GET /api/restaurants/:id/products
 * Returns the product array (the menu) of a specific restaurant
 */
const getRestaurantProducts = async (req, res) => {
    try {
        const products = await restaurantService.getRestaurantProducts(req.params.id);
        return res.status(200).json(products);
    } catch (error) {
        if (error.message === "Not Found") {
            return res.status(404).json({ error: "Not Found" });
        }
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * Dealing with the request: POST /api/restaurants/:id/products
 * Adds a new product to the specific restaurant's menu
 */
const createProduct = async (req, res) => {
    try {
        const ownerId = req.user.userId;
        const newProduct = await restaurantService.addProductToRestaurant(req.params.id, req.body, ownerId);
        return res.status(201).json(newProduct);
    } catch (error) {
        if (error.message === "Not Found or Unauthorized") {
            return res.status(403).json({ error: "Not Found or Unauthorized" });
        }
        return res.status(400).json({ error: error.message });
    }
};

/**
 * Dealing with the request: GET /api/restaurants/:id/products/:pid
 * Returns a specific product from a specific restaurant 
 */
const getProductById = async (req, res) => {
    const restaurantId = req.params.id;
    const productId = req.params.pid;

    try {
        // Getting the product details from the service
        const product = await restaurantService.getProductFromRestaurant(restaurantId, productId);

        // Gateway interaction - sending a view interaction to the C++ server
        try {
            const token = req.headers.authorization;
            if (token) {
                const user = await userService.getUserById(token); // Assuming this needs await too
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

        // Successfully retrieved the product, returning it in the response
        return res.status(200).json(product);

    } catch (error) {
        if (error.message === "Not Found") {
            return res.status(404).json({ error: "Product Not Found" });
        }
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * Dealing with the request: PATCH /api/restaurants/:id/products/:pid
 * Updating a specific product on the menu
 */
const updateProduct = async (req, res) => {
    const restaurantId = req.params.id;
    const productId = req.params.pid;

    try {
        const ownerId = req.user.userId;
        // Updating the product details in the service
        const updated = await restaurantService.updateRestaurantProduct(restaurantId, productId, req.body, ownerId);
        
        // Gateway interaction - sending an update interaction to the C++ server
        try {
            const token = req.headers.authorization;
            if (token) {
                const user = await userService.getUserById(token);
                if (user) {
                    console.log(`[Gateway] Sending POST interaction for User: ${user.id}, Product: ${productId}`);
                    await cppGateway.sendPostInteraction(user.id, productId); 
                }
            }
        } catch (cppError) {
            console.error("[Gateway Error] Could not sync update interaction with C++ server:", cppError.message);
        }

        return res.status(204).send();
    } catch (error) {
        if (error.message === "Not Found or Unauthorized") {
            return res.status(403).json({ error: "Product Not Found or Unauthorized" });
        }
        return res.status(400).json({ error: error.message });
    }
};

/**
 * Dealing with the request: DELETE /api/restaurants/:id/products/:pid
 * Deleting a specific product from a restaurant's menu
 */
const deleteProduct = async (req, res) => {
    const restaurantId = req.params.id;
    const productId = req.params.pid;

    try {
        const ownerId = req.user.userId;
        // Deleting the product from the restaurant's menu in the service
        await restaurantService.deleteRestaurantProduct(restaurantId, productId, ownerId);
        
        // Gateway interaction - sending a delete interaction to the C++ server
        try {
            const token = req.headers.authorization;
            if (token) {
                const user = await userService.getUserById(token);
                if (user) {
                    console.log(`[Gateway] Sending DELETE interaction for User: ${user.id}, Product: ${productId}`);
                    await cppGateway.deleteOrderInteraction(user.id, productId);
                }
            }
        } catch (cppError) {
            console.error("[Gateway Error] Could not sync delete interaction with C++ server:", cppError.message);
        }

        return res.status(204).send();
    } catch (error) {
        if (error.message === "Not Found or Unauthorized") {
            return res.status(403).json({ error: "Product Not Found or Unauthorized" });
        }
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * Dealing with the request: GET /api/search/:query
 * Returns search results for restaurants and products
 */
const searchItems = async (req, res) => {
    try {
        // Take the url from the search word, URL (req.params.query)
        const query = req.params.query;

        // Call to the search func  
        const searchResults = await restaurantService.search(query);

        // Return 200 with ok
        return res.status(200).json(searchResults);

  } catch (error) {
        // Check if the server died 
        console.error("Error in searchItems:", error); 
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};
const getMyRestaurants = async (req, res) => {
    try {
       
        const ownerId = req.user.userId || req.user.id; 
        const restaurants = await Restaurant.find({ ownerId: ownerId });
        res.status(200).json(restaurants);
    } catch (error) {
        res.status(500).json({ message: "Error fetching your restaurants", error });
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
    deleteProduct, 
    searchItems,
    getMyRestaurants
};