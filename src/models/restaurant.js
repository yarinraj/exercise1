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

module.exports = {
    getAll,
    create,
    getById,
    update,
    remove
};