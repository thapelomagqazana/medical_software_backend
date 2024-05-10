const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/userModel');
const bcrypt = require('bcrypt');
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');


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

describe('Authentication API', () => {
    // Mock user data for testing
    const userData = {
        username: 'Test User',
        email: 'test@example.com',
        password: 'password123'
    };

    // Set up test data before each test
    // beforeEach(async () => {
    //     // Create a test user
    //     user = await User.create(userData);
    //   });
    
      // Delete test data after each test
      afterEach(async () => {
        // Delete test user
        await User.deleteMany({});
      });

    // Register user test case
    it('should register a new user', async () => {
        // Send a request to register a new user
        const response = await request(app)
            .post('/api/auth/register')
            .send(userData);

        // Check if the response status code is 201
        expect(response.status).toBe(201);

        // Check if the response body contains the user and token
        expect(response.body).toHaveProperty('user');
        expect(response.body).toHaveProperty('token');

        // Verify the user is saved in the database
        const user = await User.findOne({ email: userData.email });
        expect(user).toBeTruthy();

        // Verify the password is hashed
        const isPasswordMatch = await bcrypt.compare(userData.password, user.password);
        expect(isPasswordMatch).toBe(true);

        // Verify the token is valid
        const decoded = jwt.verify(response.body.token, 'your_secret_key');
        expect(decoded._id).toBe(user._id.toString());
    });

    // Login user test case
    it('should login an existing user', async () => {
        // Create a new user in the database
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await User.create({ ...userData, password: hashedPassword });

        // Send a request to login the user
        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: userData.email, password: userData.password });

        // Check if the response status code is 200
        expect(response.status).toBe(200);

        // Check if the response body contains the user and token
        expect(response.body).toHaveProperty('user');
        expect(response.body).toHaveProperty('token');

        // Verify the token is valid
        const decoded = jwt.verify(response.body.token, 'your_secret_key');
        const user = await User.findOne({ email: userData.email });
        expect(decoded._id).toBe(user._id.toString());
    });

    // Error handling test case - invalid credentials
    it('should return an error for invalid credentials', async () => {
        // Send a request with invalid credentials
        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'invalid@example.com', password: 'invalidpassword' });

        // Check if the response status code is 400
        expect(response.status).toBe(400);

        // Check if the response body contains the error message
        expect(response.body).toEqual({ message: 'Invalid email or password' });
    });
});
