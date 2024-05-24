const request = require('supertest');
const app = require('../../src/app');
const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Appointment = require('../../src/models/appointmentModel');
const Provider = require('../../src/models/providerModel');
const User = require("../../src/models/userModel");
const { getAvailableSlots, bookAppointment } = require("../../src/controllers/appointmentController");



  
  // Test suite for Appointment Controller
  describe("Appointment Controller", () => {
    let user;
    let token;
    let provider;
    // Mock appointment data for testing
    const appointmentData = {
        providerName: "Test Provider",
        startTime: new Date(2024, 4, 25, 10, 30),
        endTime: new Date(2024, 4, 25, 11, 30),
    };

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

    beforeEach(async () => {
        const hashedPassword = await bcrypt.hash('password123', 10);
        user = await User.create({ firstName: 'Test', lastName: "User", email: 'test@example.com', password: hashedPassword });
        provider = await Provider.create({ name: "Test Provider", specialty: "General Medicine", userId: user._id });
        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test@example.com', password: 'password123' });
        token = response.body.token;
        
    });

    afterEach(async () => {
        await User.deleteMany();
        await Provider.deleteMany();
        await Appointment.deleteMany();
    });

    // Retrieve available appointment slots test case
    it("should retrieve available appointment slots", async () => {
        const response = await request(app)
            .get("/api/appointments/slots")
            .set("Authorization", `Bearer ${token}`);
        
        // console.log(response.body);
        // Check if response status is 200
        expect(response.status).toBe(200);

        // Check if response body contains appointment slots
        expect(response.body).toEqual(expect.any(Array));
    });
 
    // Book a new appointment test case
    it("should book a new appointment", async () => {
        const response = await request(app)
            .post("/api/appointments/book")
            .send(appointmentData)
            .set("Authorization", `Bearer ${token}`);
        
        // Check if response status is 201
        expect(response.status).toBe(201);

        // Check if response body contains the booked appointment
        expect(response.body).toHaveProperty("providerId");
        expect(response.body).toHaveProperty("userId");
        expect(response.body).toHaveProperty("startTime");
        expect(response.body).toHaveProperty("endTime");
    });

    // Cancel an appointment test case
    it("should cancel an appointment", async () => {
        // Create a new appointment for testing
        const appointment = await Appointment.create({ startTime: new Date(),
            endTime: new Date(), userId: user._id, providerId: provider._id });

        const response = await request(app)
            .delete(`/api/appointments/${appointment._id}`)
            .set("Authorization", `Bearer ${token}`);
        
        // Check if response status is 200
        expect(response.status).toBe(200);

        // Check if appointment is deleted from the database
        const deletedAppointment = await Appointment.findById(appointment._id);
        expect(deletedAppointment).toBeNull();
    });

    // Reschedule an appointment test case
    it("should reschedule an appointment", async () => {
        // Create a new appointment for testing
        const appointment = await Appointment.create({  startTime: new Date(),
            endTime: new Date(), userId: user._id, providerId: provider._id });
        
        const newStartTime = new Date();
        const newEndTime = new Date();

        const response = await request(app)
            .put(`/api/appointments/${appointment._id}`) 
            .send({ startTime: newStartTime, endTime: newEndTime })
            .set("Authorization", `Bearer ${token}`);
        
        // Check if response status is 200
        expect(response.status).toBe(200);

        // Check if appointment is updated in the database
        const updatedAppointment = await Appointment.findById(appointment._id);
        expect(updatedAppointment.startTime).toEqual(newStartTime);
        expect(updatedAppointment.endTime).toEqual(newEndTime);
    });

    // Invalid input: Missing required fields
    it('should return 400 if required fields are missing when booking an appointment', async () => {
        const invalidData = {
            // Missing providerName, startTime, and endTime
        };

        const response = await request(app)
            .post('/api/appointments/book')
            .send(invalidData)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message');
    });

    it('should return 404 if provider is not found when booking an appointment', async () => {
        const nonExistentProviderName = 'Non Existent Provider';

        const response = await request(app)
            .post('/api/appointments/book')
            .send({ providerName: nonExistentProviderName, startTime: new Date(2024, 4, 25, 10, 30), endTime: new Date(2024, 4, 25, 11, 30) })
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('message');
    });

    it("should return 400 if endTime is behind the startTime", async () => {
        const response = await request(app)
            .post('/api/appointments/book')
            .send({ providerName: "Test Provider", startTime: new Date(2024, 4, 26, 10, 30), endTime: new Date(2024, 4, 25, 10, 30) })
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message');
    });

    // Appointment slot already booked
    it('should return 409 if appointment slot is already booked', async () => {
        // Create a booked appointment for testing
        const appointment = await Appointment.create({ startTime: new Date(2024, 4, 25, 10, 30),
            endTime: new Date(2024, 4, 25, 11, 30), userId: user._id, providerId: provider._id });

        const response = await request(app)
            .post('/api/appointments/book')
            .send(appointmentData)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(409);
        expect(response.body).toHaveProperty('message');
    });

    // Unauthorized access
    it('should return 401 if user is not authenticated when booking an appointment', async () => {
        const response = await request(app)
            .post('/api/appointments/book')
            .send(appointmentData);

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error');
    });

    it('should return appointments matching the search query', async () => {
        await request(app)
            .post("/api/appointments/book")
            .send(appointmentData)
            .set("Authorization", `Bearer ${token}`);

        // Send a GET request to the search endpoint with the query parameter
        const response = await request(app)
            .get("/api/appointments/search")
            .query({ query: 'Test Provider' })
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        // Assert that the response contains appointments matching the search query
        expect(response.body).toHaveLength(1); // Adjust the expected length based on your test data
    });
  });