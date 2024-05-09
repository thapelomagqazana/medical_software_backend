const Appointment = require("../models/appointmentModel");
const Provider = require("../models/providerModel");

// Retrieve available appointment slots
exports.getAvailableSlots = async (req, res) => {
    try {
        const slots = await Appointment.find({ booked: false });
        res.status(200).json(slots);
    }
    catch (err) {
        // console.error("Error retrieving available slots:", err);
        res.status(500).json({ message: "Failed to retrieve available slots." });
    }
};

// Book a new appointment
exports.bookAppointment = async (req, res) => {
    const { providerName, startTime, endTime } = req.body;

    // Validate input
    if (!providerName || !startTime || !endTime){
        return res.status(400).json({ message: "Provider name, start time, and end time are required." });
    }
    try {

        // Find provider by name
        const provider = await Provider.findOne({ name: providerName });
        if (!provider){
            return res.status(404).json({ message: "Provider not found." });
        }

        // Check if appointment slot is available
        const existingAppointment = await Appointment.findOne({ providerId: provider._id, startTime, endTime });
        if (existingAppointment){
            return res.status(409).json({ message: "Appointment slot is already booked." });
        }

        // Create new appointment
        const appointment = new Appointment({
            providerId: provider._id,
            startTime,
            endTime
        });
        await appointment.save();
        res.status(201).json(appointment);
    }
    catch (err) {
        // console.error("Error booking appointment:", err);
        res.status(500).json({ message: "Failed to book appointment." });
    }
};