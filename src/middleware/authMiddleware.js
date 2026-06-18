const jwt = require('jsonwebtoken');
const User = require('../models/user');
const authMiddleware = (req, res, next) => {
  
    // Get the token from the Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expected format: "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        // Verify the token using the same secret key
        const decoded = jwt.verify(token, 'my_super_secret_key'); 
        req.user = decoded; // Save user info in the request object for later use
        next(); // Proceed to the next middleware or controller
    } catch (error) {
        console.error("--- JWT VERIFICATION ERROR ---", error.message);
        return res.status(403).json({ error: "Invalid or expired token." });
    }
};
// middleware to check if the user has the 'owner' role before allowing access to certain routes
const isOwner = (req, res, next) => {
  if (req.user && req.user.role === 'owner') {
    next();
  } else {
    return res.status(403).json({ 
      message: 'Access denied. Only restaurant owners are allowed to perform this action.' 
    });
  }
};
const optionalAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // Guest user: continue without req.user
    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, 'my_super_secret_key');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: "Invalid or expired token." });
    }
};

module.exports = {
    authMiddleware,
     optionalAuthMiddleware,
    isOwner
};