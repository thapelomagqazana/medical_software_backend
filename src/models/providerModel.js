const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    specialty: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true

    }
    // Other provider details such as contact information, address, etc.
});

const Provider = mongoose.model('Provider', providerSchema);

module.exports = Provider;
