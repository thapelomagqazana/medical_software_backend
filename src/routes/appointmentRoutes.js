const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");

// Retrieve available appointment slots
router.get("/slots", appointmentController.getAvailableSlots);

// Book a new appointment
router.post("/book", appointmentController.bookAppointment);

// Cancel an appointment
router.delete("/:id", appointmentController.cancelAppointment);

// Reschedule an appointment
router.put("/:id", appointmentController.updateAppointment);


module.exports = router;