const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require("../models/userModel");

// Controller function for user login
exports.loginUser = async (req, res) => {
    try {
        // Find user by email
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Compare passwords
        const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ _id: user._id }, 'your_secret_key');

        // Respond with the user and token
        res.status(200).json({ user, token });
    } catch (error) {
        res.status(500).json({ message: 'Failed to login user' });
    }
};

// Controller function for user registration
exports.registerUser = async (req, res) => {
    try {
        // Check if the email is already registered
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Create a new user
        const user = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hashedPassword
        });

        // Save the user to the database
        await user.save();

        // Generate JWT token
        const token = jwt.sign({ _id: user._id }, 'your_secret_key');

        // Respond with the user and token
        res.status(201).json({ user, token });
    } catch (error) {
        res.status(500).json({ message: 'Failed to register user' });
    }
};