const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

require("dotenv").config();

const app = express();

const corsOptions = {
    origin: "http://localhost:3001",
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Use Morgan middleware for logging
app.use(morgan("dev"));

// Routes
const appointmentRoutes = require("./routes/appointmentRoutes");
const providerRoutes = require("./routes/providerRoutes");
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/messages", messageRoutes);


module.exports = app;

