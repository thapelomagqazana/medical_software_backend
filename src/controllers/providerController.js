const Provider = require("../models/providerModel");

// Create a new provider
exports.createProvider = async (req, res) => {
    try {
        const { name, specialty } = req.body;
        const provider = new Provider({ name, specialty });
        await provider.save();
        res.status(201).json(provider);
    }catch (error){
        res.status(400).json({ message: error.message });
    }
};

// Get all providers
exports.getAllProviders = async (req, res) => {
    try {
        const providers = await Provider.find();
        res.status(200).json(providers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};