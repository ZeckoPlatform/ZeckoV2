const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Log the MongoDB URI to make sure it's loaded
console.log('MongoDB URI:', process.env.MONGODB_URI || 'No MongoDB URI found in .env');

// Simple test connection
async function testConnection() {
    try {
        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Successfully connected to MongoDB!');
        
        // Create a temporary collection and document
        const TestModel = mongoose.model('Test', new mongoose.Schema({ test: String }));
        await TestModel.create({ test: 'test' });
        console.log('Successfully created test document!');
        
        await mongoose.connection.close();
        console.log('Connection closed.');
    } catch (error) {
        console.error('Error occurred:', error.message);
    }
}

testConnection(); 