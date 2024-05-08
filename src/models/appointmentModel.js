const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Provider",
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    booked: {
        type: Boolean,
        default: false
    }
})

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;