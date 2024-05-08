const Appointment = require('../../src/models/appointmentModel');
const Provider = require('../../src/models/providerModel');
const mongoose = require('mongoose');

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

describe('Appointment Model', () => {
  it('should create a new appointment', async () => {
    // Create a test provider
    const provider = await Provider.create({ name: 'Test Provider', specialty: 'Test Specialty' });  
    const appointmentData = {
      providerId: provider._id,
      startTime: new Date('2024-06-01T09:00:00'),
      endTime: new Date('2024-06-01T10:00:00')
    };
    const appointment = new Appointment(appointmentData);
    await appointment.save();
    expect(appointment).toMatchObject(appointmentData);
  });
});
