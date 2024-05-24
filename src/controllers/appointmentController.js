const Appointment = require("../models/appointmentModel");
const Provider = require("../models/providerModel");

// Retrieve available appointment slots
exports.getAvailableSlots = async (req, res) => {
    try {
        const slots = await Appointment.find({ userId: req.user._id, booked: false });
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

    // Check if endTime is ahead of startTime
    if (endTime <= startTime) {
        return res.status(400).json({ message: "End time must be after start time." });
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
            userId: req.user._id,
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

// Cancel an appointment
exports.cancelAppointment = async (req, res) => {
    try {
        const id = req.params.id;
        const appointment = await Appointment.findById(id);
    
        if (!appointment){
            return res.status(404).json({ message: "Appointment not found" });
        }

        await Appointment.deleteOne(appointment._id);
        res.status(200).json({ message: "Appointment canceled successfully" });
    } catch (error){
        res.status(500).json({ message: "Failed to cancel appointment" });
    }
};

// Reschedule an appointment
exports.updateAppointment = async (req, res) => {
    try {
        const { startTime, endTime } = req.body;
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment){
            return res.status(404).json({ message: "Appointment not found" });
        }

        appointment.startTime = startTime;
        appointment.endTime = endTime;
        await appointment.save();
        res.status(200).json({ message: "Appointment rescheduled successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to reschedule appointment" });
    }
};

// Search for appointments
exports.searchAppointments = async (req, res) => {
    const { query } = req.query;
    
    try {
        let appointments;
        
        if (query){
            const regex = new RegExp(query, "i"); // Case-insensitive regex for partial matches

            appointments = await Appointment.find().populate('providerId userId');
            appointments = appointments.filter(appointment =>
                regex.test(appointment.providerId.name) || regex.test(appointment.userId.firstName)
            );
            // console.log(appointments);
        } else {
            return res.status(400).json({ message: "Query is required" });
        }

        res.status(200).json(appointments);
    } catch (error) {
        // console.error('Error searching appointments:', error);
        res.status(500).json({ message: 'Failed to search appointments.' });
    }
};