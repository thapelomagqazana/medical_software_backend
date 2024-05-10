const express = require("express");
const Message = require("../models/messageModel");
const Appointment = require("../models/appointmentModel");

// Send a message
exports.createMessage = async (req, res) => {
    try {
        const { appointmentId, recipientId, content } = req.body;

        const existingAppointment = await Appointment.findById(appointmentId);
        if (!existingAppointment){
            return res.status(409).json({ message: "The appointment does not exist." });
        }

        if (!recipientId || !content){
            return res.status(400).json({ message: "Recipient ID and content are required." });
        }

        // Create a new message
        const message = new Message({
            appointmentId: existingAppointment._id,
            senderId: req.user._id,
            recipientId,
            content
        });

        // Save the message to the database
        await message.save();

        // Respond with the created message
        res.status(201).json(message);
    } catch (error){
        res.status(500).json({ message: "Failed to send message" });
    }
};