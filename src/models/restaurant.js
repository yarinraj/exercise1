const restaurants = [];

const getAll = () => {
    return restaurants;
};

const create = (restaurantData) => {
    const newRestaurant = {
        id: crypto.randomUUID(), 
        name: restaurantData.name,
    };
    
    restaurants.push(newRestaurant);
    return newRestaurant;
};

module.exports = {
    getAll,
    create
};