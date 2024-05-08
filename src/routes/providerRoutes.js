const express = require("express");
const router = express.Router();
const providerController = require("../controllers/providerController");

// Get all providers
router.get("/all", providerController.getAllProviders);

// Create a provider
router.post("/create", providerController.createProvider);

module.exports = router;