const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            heartbeatFrequencyMS: 30000,
            maxPoolSize: 50,
            minPoolSize: 5,
            maxIdleTimeMS: 30000,
            retryWrites: true,
            w: 'majority'
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);

        mongoose.connection.on('error', err => {
            console.error('MongoDB error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected. Attempting to reconnect...');
            setTimeout(connectDB, 5000);
        });

        mongoose.connection.on('connected', () => {
            console.log('MongoDB connection established successfully');
        });

        return conn;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        setTimeout(connectDB, 5000);
    }
};

module.exports = connectDB; 