const Appointment = require("../models/appointmentModel");

// Retrieve available appointment slots
exports.getAvailableSlots = async (req, res) => {
    try {
        const slots = await Appointment.find({ booked: false });
        res.status(200).json(slots);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Book a new appointment
exports.bookAppointment = async (req, res) => {
    const { providerId, startTime, endTime } = req.body;
    try {
        const appointment = new Appointment({
            providerId,
            startTime,
            endTime
        });
        await appointment.save();
        res.status(201).json(appointment);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};