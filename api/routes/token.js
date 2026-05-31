const express = require('express');
const router = express.Router();

//import the tokem controller we just created
const tokenController = require('../controllers/token');
// Route to handle POST requests for login (creates a token)
// Since this router will be mapped to '/api/tokens' in app.js, 
// the '/' here means the exact path '/api/tokens'
router.post('/', tokenController.createToken);

module.exports = router;