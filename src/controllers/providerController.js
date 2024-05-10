const Provider = require("../models/providerModel");

// Create a new provider
exports.createProvider = async (req, res) => {
    try {
        const { name, specialty } = req.body;

        // Input validation
        if (!name || !specialty){
            return res.status(400).json({ message: "Name and specialty are required." });
        }

        // Check if the provider with the same name and specialty already exists
        const existingProvider = await Provider.findOne({ name, specialty });
        if (existingProvider){
            return res.status(409).json({ message: "Provider with the same name and specialty already exists." });
        }

        // Create and save the new provider
        const provider = new Provider({ name, specialty, userId: req.user._id });
        await provider.save();
        res.status(201).json(provider);
    }catch (error){
        res.status(400).json({ message: "Failed to create provider." });
    }
};

// Get all providers
exports.getAllProviders = async (req, res) => {
    try {
        const providers = await Provider.find();
        res.status(200).json(providers);
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve providers." });
    }
};

// Get provider by ID
exports.getProvider = async (req, res) => {
    try {
        const provider = await Provider.findById(req.params.id);
        if (!provider){
            return res.status(404).json({ message: "Provider not found" });
        }
        res.status(200).json(provider);
    } catch (error){
        res.status(500).json({ message: "Failed to retrieve provider" });
    }
};