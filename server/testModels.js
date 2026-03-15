require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const { generateToken, verifyToken } = require('./utils/jwt');

const test = async () => {
  await connectDB();

  // Create a test user
  const testUser = new User({
  name: 'Test NGO',
  email: 'ngo@example.com',
  password: 'password123',
  role: 'ngo',
  phone: '+1234567890',
  // no location field
});

  try {
    // Save user (password will be hashed automatically)
    await testUser.save();
    console.log('✅ User saved successfully');

    // Test password comparison
    const isMatch = await testUser.comparePassword('password123');
    console.log('Password match:', isMatch);

    // Generate JWT
    const token = generateToken(testUser._id, testUser.role);
    console.log('JWT:', token);

    // Verify JWT
    const decoded = verifyToken(token);
    console.log('Decoded token:', decoded);

    // Clean up: delete test user
    await User.deleteOne({ _id: testUser._id });
    console.log('✅ Test user deleted');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    process.exit(0);
  }
};

test();