const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// Middleware function to authenticate users
const authenticateUser = async (req, res, next) => {
    try {
        // Extract the token from the request headers
        const token = req.header("Authorization").replace("Bearer ", "");

        // Verify the token
        const decoded = jwt.verify(token, "your_secret_key");

        // Find the user by ID and token
        const user = await User.findOne({ _id: decoded._id });

        if (!user){
            throw new Error();
        }

        // Attach the user and token to the request object for use in the route handlers
        req.user = user;
        req.token = token;

        // Move to the next middleware or route handler
        next();
    } catch (error){
        res.status(401).json({ error: "Please authenticate." });
    }
};

module.exports = authenticateUser;