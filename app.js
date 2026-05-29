const express = require('express');
const app = express();

app.use(express.json());

const restaurantRoutes = require('./src/routes/restaurant');

app.use('/api/restaurants', restaurantRoutes);

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} - (DELETE BEFORE SUBMITION)`);
});