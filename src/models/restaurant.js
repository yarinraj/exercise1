const crypto = require('crypto');
// // const restaurants = [];

const restaurants = [
    { 
        id: "1", 
        name: "Burgers & Co", 
        cuisine: "Burgers", 
        phone: "0312345678", 
        address: "Herzl 12",
        lat: 32.0697, 
        lng: 34.8010,
        isPromoted: true,
        products: [
            {
                id: "b1",
                name: "Classic Cheeseburger",
                description: "Juicy beef patty with melted cheddar cheese, fresh lettuce, and tomato.",
                price: 52,
                image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500"
            },
            {
                id: "b2",
                name: "Crispy Chicken Wings",
                description: "8 pieces of crispy golden wings tossed in BBQ sauce.",
                price: 45,
                image: "" 
            }
        ]
    },
    { 
        id: "2", 
        name: "Pizza Piazza", 
        cuisine: "Italian", 
        phone: "0498765432", 
        address: "Bialik 45",
        lat: 32.0914, 
        lng: 34.8115,
        isPromoted: false,
        products: [
        {
            id: "p1",
            name: "Margarita Pizza",
            description: "Classic tomato sauce, fresh mozzarella, and basil leaves.",
            price: 60,
            image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500"
        }
        ]
    },
    { 
        id: "3", 
        name: "Sushi Station", 
        cuisine: "Asian", 
        phone: "0255544332", 
        address: "Jaffa 89",
        lat: 32.0512, 
        lng: 34.7532,
        isPromoted: false,
        products: [
            {
                id: "p1",
                name: "Margarita Pizza",
                description: "Classic tomato sauce, fresh mozzarella, and basil leaves.",
                price: 60,
                image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500"
            }
        ]
    }
];

const getAll = () => {
    return restaurants;
};

const create = (restaurantData) => {
    const { name, cuisine, phone, address, products, lat, lng, isPromoted } = restaurantData;

    if (phone) {
        const isNumeric = /^\d+$/.test(phone);
        if (!isNumeric || phone.length > 10) {
            throw new Error("Phone must contain only numbers and be up to 10 digits long");
        }
    }

    const newRestaurant = {
        id: crypto.randomUUID(), 
        name: name,
        cuisine: cuisine,
        description: restaurantData.description,
        phone: phone || null, 
        address: address || null,
        //Latitude
        lat: lat !== undefined ? Number(lat) : null,
        //Longitude
        lng: lng !== undefined ? Number(lng) : null,
        isPromoted: isPromoted === true || isPromoted === 'true',
        products: Array.isArray(products) ? products : []
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
        description: productData.description,
        price: productData.price,
        image: productData.image || ""
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
//text search across resturants and products 
const search = (query) => {
    const lowerCaseQuery = query.toLowerCase();
    //prepare the undified results object as required by the ticket
    const results = { 
        restaurants: [],
        products: []
    };
    for (const restaurant of restaurants) {
        const matchResturantName = restaurant.name?.toLowerCase().includes(lowerCaseQuery);
        const matchRestaurantDesc = restaurant.description?.toLowerCase().includes(lowerCaseQuery);
        if (matchResturantName || matchRestaurantDesc) {
            results.restaurants.push(restaurant);
        }
        if (restaurant.products && Array.isArray(restaurant.products)) {
            for (const product of restaurant.products) {
                const matchProductName = product.name?.toLowerCase().includes(lowerCaseQuery);
                const matchProductDesc = product.description?.toLowerCase().includes(lowerCaseQuery);

                if (matchProductName || matchProductDesc) {
                    results.products.push(product);
                }
            }
        }
    }
    return results;
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
    getProductById,
    search
};