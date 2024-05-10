const express = require("express");
const router = express.Router();
const providerController = require("../controllers/providerController");
const authenticateUser = require("../middleware/authenticateUser");

// Get all providers
router.get("/all", authenticateUser, providerController.getAllProviders);

// Create a provider
router.post("/create", authenticateUser, providerController.createProvider);

module.exports = router;