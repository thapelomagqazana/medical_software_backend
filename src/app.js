const express = require("express");

require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());

// Routes
const appointmentRoutes = require("./routes/appointmentRoutes");
const providerRoutes = require("./routes/providerRoutes");

app.use("/api/appointments", appointmentRoutes);
app.use("/api/providers", providerRoutes);


module.exports = app;

