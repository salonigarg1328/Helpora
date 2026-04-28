const request = require('supertest');
const app = require('../app'); // you may need to export app from app.js
const User = require('../models/User');

describe('Authentication', () => {
  test('should hash password correctly', async () => {
    const user = new User({ name: 'Test', email: 'test@test.com', password: '123456' });
    await user.save();
    expect(user.password).not.toBe('123456');
    const isMatch = await user.comparePassword('123456');
    expect(isMatch).toBe(true);
  });
});