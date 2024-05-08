const request = require('supertest');
const app = require('../../src/app');
const mongoose = require('mongoose');
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

describe('Provider Controller', () => {
  // Before each test, clear the Provider collection and add test data
  beforeEach(async () => {
    await Provider.deleteMany();
    await Provider.create({ name: 'Provider 1', specialty: 'Specialty 1' });
    await Provider.create({ name: 'Provider 2', specialty: 'Specialty 2' });
  });

  // Test case for creating a new provider
  it('should create a new provider', async () => {
    const response = await request(app)
      .post('/api/providers/create')
      .send({ name: 'New Provider', specialty: 'New Specialty' });
    expect(response.status).toBe(201);
    expect(response.body.name).toBe('New Provider');
    expect(response.body.specialty).toBe('New Specialty');
  });

  // Test case for getting all providers
  it('should get all providers', async () => {
    const response = await request(app).get('/api/providers/all');
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2); // Assuming 2 providers are added in beforeEach
  });
});
