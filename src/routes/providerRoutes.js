const express = require("express");
const router = express.Router();
const providerController = require("../controllers/providerController");
const authenticateUser = require("../middleware/authenticateUser");

// Get all providers
router.get("/all", authenticateUser, providerController.getAllProviders);

// Create a provider
router.post("/create", authenticateUser, providerController.createProvider);

// Get a provider by ID
router.get("/:id", authenticateUser, providerController.getProvider);

module.exports = router;