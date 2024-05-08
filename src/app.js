const express = require("express");

require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());

// Routes
const appointmentRoutes = require("./routes/appointmentRoutes");
app.use("/api/appointments", appointmentRoutes);


module.exports = app;

