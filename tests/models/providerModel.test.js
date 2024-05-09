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


describe('Provider Model', () => {
  // Before each test, clear the Provider collection
  beforeEach(async () => {
    await Provider.deleteMany();
  });

  // Test case for creating a new provider
  it('should create a new provider', async () => {
    const providerData = { name: 'New Provider', specialty: 'New Specialty' };
    const provider = new Provider(providerData);
    await provider.save();
    const savedProvider = await Provider.findOne({ name: 'New Provider' });
    expect(savedProvider).toMatchObject(providerData);
  });

  // Test case for required fields (name and specialty)
  it('should not create a provider without required fields', async () => {
    const provider = new Provider({});
    let error;
    try {
      await provider.save();
    } catch (err) {
      error = err;
    }
    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
  });
});
