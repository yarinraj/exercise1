const express = require('express');
const router = express.Router();
const net = require('net');
const Restaurant = require('../models/restaurant'); 

// GET /api/recommendations
router.get('/', (req, res) => {
    const { productId, restaurantId } = req.query;

    if (!productId || !restaurantId) {
        return res.status(400).json({ error: 'Missing productId or restaurantId' });
    }

    const client = new net.Socket();
    let cppResponse = '';

    client.connect(5005, '127.0.0.1', () => {
        const command = `recommend --user guest_user --product ${productId} --restaurant ${restaurantId}\n`;
        client.write(command);
    });

    client.on('data', (data) => {
        cppResponse += data.toString();
        client.end(); 
    });

    client.on('end', async () => {
        try {
            const recommendedIds = cppResponse.trim().split(/\s+/).filter(Boolean);
            
            if (recommendedIds.length === 0) {
                return res.json([]);
            }

            const restaurant = await Restaurant.findById(restaurantId);
            
            if (!restaurant || !restaurant.products) {
                return res.json([]); 
            }

            const fullRecommendedProducts = restaurant.products.filter(product => 
                recommendedIds.includes(product._id.toString())
            );

            res.json(fullRecommendedProducts);

        } catch (error) {
            console.error('Error fetching recommendations from MongoDB:', error);
            res.status(500).json({ error: 'Internal server error fetching recommendations' });
        }
    });

    client.on('error', (err) => {
        console.error('C++ Socket Error:', err.message);
        res.status(503).json({ error: 'Recommendation server offline' });
    });
});

module.exports = router;