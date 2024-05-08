const request = require('supertest');
const app = require('../../src/app');
const mongoose = require('mongoose');
const Appointment = require('../../src/models/appointmentModel');
const Provider = require('../../src/models/providerModel');

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
        .send({ providerId: provider._id, startTime: '2024-06-01T09:00:00', endTime: '2024-06-01T10:00:00' });
      expect(response.status).toBe(201);
      // Add more assertions as needed
    });
  });