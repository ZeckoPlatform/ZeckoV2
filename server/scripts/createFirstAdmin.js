const mongoose = require('mongoose');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const createFirstAdmin = async () => {
  try {
    console.log('Starting admin creation process...');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully!');
    
    // Check if admin already exists
    console.log('Checking for existing admin...');
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      console.log('Admin already exists with email:', adminExists.email);
      process.exit(0);
    }
    
    console.log('Creating new admin user...');
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      status: 'active'
    });

    await adminUser.save();
    console.log('----------------------------------------');
    console.log('Admin user created successfully!');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    console.log('----------------------------------------');
    
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

// Add error handlers for unhandled promises and rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

console.log('Script started...');
createFirstAdmin();