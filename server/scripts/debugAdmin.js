// Import required modules
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Immediate logging
console.log('Script started');
console.log('Current directory:', process.cwd());

// Load and verify environment variables
try {
    const envPath = path.join(process.cwd(), '.env');
    console.log('Looking for .env at:', envPath);
    
    if (fs.existsSync(envPath)) {
        console.log('.env file found');
        dotenv.config();
        console.log('Environment variables loaded');
        console.log('MONGODB_URI present:', !!process.env.MONGODB_URI);
    } else {
        throw new Error('.env file not found');
    }
} catch (error) {
    console.error('Environment setup error:', error);
    process.exit(1);
}

// Define User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    status: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Main function
async function createAdmin() {
    let connection;
    try {
        console.log('Attempting to connect to MongoDB...');
        connection = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Check for existing admin
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('Admin already exists:', existingAdmin.email);
            return;
        }

        // Create new admin
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 10);

        const adminUser = new User({
            name: 'Admin User',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'admin',
            status: 'active'
        });

        await adminUser.save();
        console.log('Admin created successfully!');
        console.log('Email: admin@example.com');
        console.log('Password: admin123');

    } catch (error) {
        console.error('Error in createAdmin:', error);
    } finally {
        if (connection) {
            console.log('Closing MongoDB connection...');
            await mongoose.connection.close();
            console.log('Connection closed');
        }
        process.exit(0);
    }
}

// Execute with error handling
createAdmin().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
}); 