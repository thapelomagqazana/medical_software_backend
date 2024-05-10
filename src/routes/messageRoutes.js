const express = require('express');
const router = express.Router();
const { createMessage } = require('../controllers/messageController');
const authenticateUser = require("../middleware/authenticateUser");

// Route for message creation
router.post('/create', authenticateUser, createMessage);


module.exports = router;