const request = require('supertest');
const app = require('../../src/app');
const mongoose = require('mongoose');
const Provider = require('../../src/models/providerModel');
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

describe('createProvider', () => {
  it('should create a new provider', async () => {
      const req = { body: { name: 'Provider Name', specialty: 'Specialty' } };
      const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
      };

      jest.spyOn(Provider, 'findOne').mockResolvedValue(null);
      jest.spyOn(Provider.prototype, 'save').mockResolvedValue({ _id: 'providerId', name: 'Provider Name', specialty: 'Specialty' });

      await createProvider(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      // expect(res.json).toHaveBeenCalledWith({ _id: 'providerId', name: 'Provider Name', specialty: 'Specialty' });
  });

  it('should handle missing name or specialty', async () => {
      const req = { body: {} };
      const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
      };

      await createProvider(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Name and specialty are required." });
  });

  it('should handle duplicate provider name', async () => {
      const req = { body: { name: 'Provider Name', specialty: 'Specialty' } };
      const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
      };

      jest.spyOn(Provider, 'findOne').mockResolvedValue({ _id: 'existingProviderId', name: 'Provider Name', specialty: 'Specialty' });

      await createProvider(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: "Provider with the same name already exists." });
  });

  // it('should handle database error', async () => {
  //     const req = { body: { name: 'Provider Name', specialty: 'Specialty' } };
  //     const res = {
  //         status: jest.fn().mockReturnThis(),
  //         json: jest.fn()
  //     };

  //     jest.spyOn(Provider, 'findOne').mockRejectedValue(new Error('Database error'));

  //     await createProvider(req, res);

  //     expect(res.status).toHaveBeenCalledWith(500);
  //     expect(res.json).toHaveBeenCalledWith({ message: "Failed to create provider." });
  // });
});

describe('getAllProviders', () => {
  it('should get all providers', async () => {
      const mockProviders = [
          { _id: 'providerId1', name: 'Provider 1', specialty: 'Specialty 1' },
          { _id: 'providerId2', name: 'Provider 2', specialty: 'Specialty 2' }
      ];

      const req = {};
      const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
      };

      jest.spyOn(Provider, 'find').mockResolvedValue(mockProviders);

      await getAllProviders(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockProviders);
  });

  it('should handle database error', async () => {
      const req = {};
      const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
      };

      jest.spyOn(Provider, 'find').mockRejectedValue(new Error('Database error'));

      await getAllProviders(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Failed to retrieve providers." });
  });
});
