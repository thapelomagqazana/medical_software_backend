const app = require("./app");
const mongoose = require("mongoose");


const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB");
}).catch(err => {
    console.error("Error connecting to MongoDB:", err.message)
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});