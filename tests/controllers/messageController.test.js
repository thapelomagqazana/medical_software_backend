const request = require('supertest');
const app = require('../../src/app');
const mongoose = require('mongoose');
const Message = require('../../src/models/messageModel');
const Appointment = require('../../src/models/appointmentModel');
const User = require('../../src/models/userModel');
const Provider = require("../../src/models/providerModel");
const bcrypt = require("bcrypt");

// Connect to the test database before running tests
beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/testDB', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

// Disconnect from the test database after running tests
afterAll(async () => {
    await mongoose.connection.close();
});

describe('Message Controller', () => {
    let sender;
    let admin;
    let receiver;
    let token;
    let appointment;
    let provider;

    beforeEach(async () => {
        const hashedPassword = await bcrypt.hash('password123', 10);
        sender = await User.create({ firstName: 'TestSender', lastName: "UserSender", email: 'test@example.com', password: hashedPassword });

        const hashedPassword2 = await bcrypt.hash('password555', 10);
        admin = await User.create({ firstName: 'TestAdmin', lastName: "UserAdmin", email: 'testadmin@example.com', password: hashedPassword2 });

        const hashedPassword1 = await bcrypt.hash('password144', 10);
        // Create a user for testing
        receiver = await User.create({
            firstName: 'TestReceiver',
            lastName: "Receiver",
            email: 'testreceiver@example.com',
            password: hashedPassword1
        });

        provider = await Provider.create({
            name: "John Doe",
            specialty: "Specialty 1",
            userId: admin._id
        });



        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test@example.com', password: 'password123' });

        token = response.body.token;

        // Create an appointment for testing
        appointment = await Appointment.create({
            providerId: provider._id,
            userId: admin._id,
            startTime: new Date(2024, 4, 25, 10, 30),
            endTime: new Date(2024, 4, 25, 11, 30)

        });
    });

    afterEach(async () => {
        // Clear the message collection after each test
        await Message.deleteMany();
        await User.deleteMany();
        await Appointment.deleteMany();
        await Provider.deleteMany();
    });

    it('should create a new message', async () => {
        const response = await request(app)
            .post('/api/messages/create')
            .send({
                appointmentId: appointment._id,
                recipientId: receiver._id,
                content: 'Test message content'
            })
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(201);
        expect(response.body.content).toBe('Test message content');
    });

    it('should return 409 if the appointment does not exist', async () => {
        const response = await request(app)
            .post('/api/messages/create')
            .send({
                appointmentId: mongoose.Schema.Types.ObjectId,
                recipientId: receiver._id,
                content: 'Test message content'
            })
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(409);
        expect(response.body.message).toBe('The appointment does not exist.');
    });

    it('should return 400 if recipientId or content is missing', async () => {
        const response = await request(app)
            .post('/api/messages/create')
            .send({
                appointmentId: appointment._id,
                content: 'Test message content'
            })
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Recipient ID and content are required.');
    });
});
