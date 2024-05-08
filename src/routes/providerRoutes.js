const express = require("express");
const router = express.Router();
const providerController = require("../controllers/providerController");

// Get provider by ID
router.get("/:id", providerController.getProviderById);

// Update provider schedule
router.put("/:id/schedule", providerController.updateProviderSchedule);

module.exports = router;