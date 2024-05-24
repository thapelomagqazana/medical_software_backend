const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");
const authenticateUser = require("../middleware/authenticateUser");

// Retrieve available appointment slots
router.get("/slots", authenticateUser, appointmentController.getAvailableSlots);

// Book a new appointment
router.post("/book", authenticateUser, appointmentController.bookAppointment);

// Cancel an appointment
router.delete("/:id", authenticateUser, appointmentController.cancelAppointment);

// Reschedule an appointment
router.put("/:id", authenticateUser, appointmentController.updateAppointment);

router.get("/search", authenticateUser, appointmentController.searchAppointments);


module.exports = router;