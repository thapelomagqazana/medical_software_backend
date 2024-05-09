const request = require('supertest');
const app = require('../../src/app');
const mongoose = require('mongoose');
const Appointment = require('../../src/models/appointmentModel');
const Provider = require('../../src/models/providerModel');
const { getAvailableSlots, bookAppointment } = require("../../src/controllers/appointmentController");

// Connect to test database before running tests
beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/testDB', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
});


// Disconnect from test database after running tests
afterAll(async () => {
    await mongoose.connection.close();
  });
  
  // Test suite for Appointment Controller
  describe('Appointment Controller', () => {
    let provider;
    let appointment;
  
    // Set up test data before each test
    beforeEach(async () => {
      // Create a test provider
      provider = await Provider.create({ name: 'Test Provider', specialty: 'Test Specialty' });
  
      // Create a test appointment
      appointment = await Appointment.create({ providerId: provider._id, startTime: new Date(), endTime: new Date() });
    });
  
    // Delete test data after each test
    afterEach(async () => {
      // Delete test appointment
      await Appointment.deleteMany({});
      // Delete test provider
      await Provider.deleteMany({});
    });
  
    // Test case for getting available appointment slots
    it('should get available appointment slots', async () => {
      const response = await request(app).get('/api/appointments/slots');
      expect(response.status).toBe(200);
      // Add more assertions as needed
    });
  
    // Test case for booking a new appointment
    it('should book a new appointment', async () => {
      const response = await request(app)
        .post('/api/appointments/book')
        .send({ providerName: 'Test Provider', startTime: '2024-06-01T09:00:00', endTime: '2024-06-01T10:00:00' });
      expect(response.status).toBe(201);
      // Add more assertions as needed
    });

    it('should delete an existing appointment', async () => {

      // Perform the DELETE request
      const response = await request(app).delete(`/api/appointments/${appointment._id}`);

      // Check the response
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Appointment canceled successfully');

      // Check if the appointment is deleted from the database
      const deletedAppointment = await Appointment.findById(appointment._id);
      expect(deletedAppointment).toBeNull();
  });

  it('should return 404 if appointment not found', async () => {
      // Perform the DELETE request with a non-existing appointment ID
      const response = await request(app).delete(`/api/appointments/${new mongoose.Types.ObjectId()}`);

      // Check the response
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Appointment not found');
  });

  it('should update the start and end time of an existing appointment', async () => {

    const newStartTime = new Date();
    const newEndTime = new Date();

    // Perform the PUT request to reschedule the appointment
    const response = await request(app)
        .put(`/api/appointments/${appointment._id}`)
        .send({ startTime: newStartTime, endTime: newEndTime });

    // Check the response
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Appointment rescheduled successfully');

    // Check if the appointment is updated in the database
    const updatedAppointment = await Appointment.findById(appointment._id);
    expect(updatedAppointment.startTime).toEqual(newStartTime);
    expect(updatedAppointment.endTime).toEqual(newEndTime);
});

it('should return 404 if appointment not found', async () => {
    // Perform the PUT request with a non-existing appointment ID
    const response = await request(app)
        .put(`/api/appointments/${new mongoose.Types.ObjectId()}`)
        .send({ startTime: new Date(), endTime: new Date() });

    // Check the response
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Appointment not found');
});
});

  describe('getAvailableSlots', () => {
    it('should return available slots', async () => {
        const mockSlots = [{ startTime: '2024-05-06T09:00:00', endTime: '2024-05-06T10:00:00' }];
        jest.spyOn(Appointment, 'find').mockResolvedValue(mockSlots);

        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await getAvailableSlots(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockSlots);
    });

    it('should handle errors', async () => {
        jest.spyOn(Appointment, 'find').mockRejectedValue(new Error('Database error'));

        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await getAvailableSlots(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Failed to retrieve available slots.' });
    });
});

describe('bookAppointment', () => {
    it('should book a new appointment', async () => {
        const mockProvider = { _id: 'providerId' };
        const mockAppointment = { providerId: 'providerId', startTime: '2024-05-06T09:00:00', endTime: '2024-05-06T10:00:00' };
        jest.spyOn(Provider, 'findOne').mockResolvedValue(mockProvider);
        jest.spyOn(Appointment, 'findOne').mockResolvedValue(null);
        jest.spyOn(Appointment.prototype, 'save').mockResolvedValue(mockAppointment);

        const req = { body: { providerName: 'Provider Name', startTime: '2024-05-06T09:00:00', endTime: '2024-05-06T10:00:00' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await bookAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        // expect(res.json).toHaveBeenCalledWith(mockAppointment);
    });

    it('should handle provider not found', async () => {
        jest.spyOn(Provider, 'findOne').mockResolvedValue(null);

        const req = { body: { providerName: 'Provider Name', startTime: '2024-05-06T09:00:00', endTime: '2024-05-06T10:00:00' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await bookAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Provider not found.' });
    });

    it('should handle appointment slot already booked', async () => {
        const mockProvider = { _id: 'providerId' };
        jest.spyOn(Provider, 'findOne').mockResolvedValue(mockProvider);
        jest.spyOn(Appointment, 'findOne').mockResolvedValue({});

        const req = { body: { providerName: 'Provider Name', startTime: '2024-05-06T09:00:00', endTime: '2024-05-06T10:00:00' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await bookAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({ message: 'Appointment slot is already booked.' });
    });

    it('should handle errors', async () => {
        jest.spyOn(Provider, 'findOne').mockRejectedValue(new Error('Database error'));

        const req = { body: { providerName: 'Provider Name', startTime: '2024-05-06T09:00:00', endTime: '2024-05-06T10:00:00' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await bookAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Failed to book appointment.' });
    });
});

