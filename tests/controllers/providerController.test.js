const request = require('supertest');
const app = require('../../src/app');
const mongoose = require('mongoose');
const Provider = require('../../src/models/providerModel');
const User = require("../../src/models/userModel");
const bcrypt = require("bcrypt");
const { createProvider, getAllProviders } = require("../../src/controllers/providerController");

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

describe('Provider Controller', () => {
  let user;
  let token;
  let provider;

  // Before each test, clear the Provider collection and add test data
  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    user = await User.create({ firstName: 'Test', lastName: "User", email: 'test@example.com', password: hashedPassword });
    provider = await Provider.create({ name: 'Provider 1', specialty: 'Specialty 1', userId: user._id });
    await Provider.create({ name: 'Provider 2', specialty: 'Specialty 2', userId: user._id });
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    token = response.body.token;
  });

  afterEach(async () => {
    await Provider.deleteMany();
    await User.deleteMany();
  });
  // Test case for creating a new provider
  it('should create a new provider', async () => {
    const response = await request(app)
      .post('/api/providers/create')
      .send({ name: 'New Provider', specialty: 'New Specialty' })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(201);
    expect(response.body.name).toBe('New Provider');
    expect(response.body.specialty).toBe('New Specialty');
  });

  // Test case for getting all providers
  it('should get all providers', async () => {
    const response = await request(app)
      .get('/api/providers/all')
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });

  // Test case for getting a provider by ID
  it("should get a provider", async () => {
    const response = await request(app)
      .get(`/api/providers/${provider._id}`)
      .set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Provider 1");
    expect(response.body.specialty).toBe("Specialty 1");
  });

  
  it('should return 400 if provider has missing required fields', async () => {
    const response = await request(app)
      .post('/api/providers/create')
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "Name and specialty are required." });
  });

  it('should return 409 if provider already exists', async () => {
    const response = await request(app)
      .post('/api/providers/create')
      .send({ name: 'Provider 1', specialty: 'Specialty 1' })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ message: "Provider with the same name and specialty already exists." });
  });
});


