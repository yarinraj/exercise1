const restaurants = [];

const getAll = () => {
    return restaurants;
};

const create = (restaurantData) => {
    const newRestaurant = {
        id: crypto.randomUUID(), 
        name: restaurantData.name,
        products: []
        // phone_number: int,
    };
    
    restaurants.push(newRestaurant);
    return newRestaurant;
};

//finding a restaurant bi ID 
const getById = (id) => {
    return restaurants.find(r => r.id === id);
};

//updating restaurant by ID  
const update = (id, updatedData) => {
    const restaurant = getById(id);
    if (restaurant && updatedData) {
        Object.assign(restaurant, updatedData);
    }
    return restaurant;
};

//delete a restaurant by ID
const remove = (id) => {
    const index = restaurants.findIndex(r => r.id === id);
    if (index !== -1) {
        restaurants.splice(index, 1);
        return true;
    }
    return false;
};

// getting the products array of a specific restaurant
const getProducts = (restaurantId) => {
    const restaurant = getById(restaurantId);
    return restaurant ? restaurant.products : null;
};

// adding a new product to the products array of a specific restaurant
const addProduct = (restaurantId, productData) => {
    const restaurant = getById(restaurantId);
    if (!restaurant) return null;

    const newProduct = {
        id: crypto.randomUUID(), 
        name: productData.name,
        price: productData.price 
    };

    restaurant.products.push(newProduct);
    return newProduct;
};

// updating a new product to the products array of a specific restaurant
const updateProduct = (restaurantId, productId, updatedProductData) => {
    const restaurant = getById(restaurantId);
    if (!restaurant) return null;

    const product = restaurant.products.find(p => p.id === productId);
    if (product && updatedProductData) {
        Object.assign(product, updatedProductData);
    }
    return product;
};

// removing a new product to the products array of a specific restaurant
const removeProduct = (restaurantId, productId) => {
    const restaurant = getById(restaurantId);
    if (!restaurant) return false;

    const productIndex = restaurant.products.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
        restaurant.products.splice(productIndex, 1);
        return true;
    }
    return false;
};

// finding a specific product in a specific restaurant
const getProductById = (restaurantId, productId) => {
    const restaurant = getById(restaurantId);
    if (!restaurant) return null;
    return restaurant.products.find(p => p.id === productId);
};

module.exports = {
    getAll,
    create,
    getById,
    update,
    remove,
    getProducts,
    addProduct,
    updateProduct,
    removeProduct,
    getProductById
};