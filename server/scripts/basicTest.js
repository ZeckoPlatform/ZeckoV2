// Basic console log to make sure the script runs
console.log('=== Starting Basic Test ===');

// Test if we can require packages
try {
    const mongoose = require('mongoose');
    console.log('Mongoose loaded successfully');
} catch (error) {
    console.log('Error loading mongoose:', error.message);
}

try {
    const dotenv = require('dotenv');
    console.log('Dotenv loaded successfully');
} catch (error) {
    console.log('Error loading dotenv:', error.message);
}

// Check if .env file exists
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
console.log('Looking for .env file at:', envPath);

if (fs.existsSync(envPath)) {
    console.log('.env file exists');
    console.log('Contents of .env file:');
    const envContents = fs.readFileSync(envPath, 'utf8');
    // Remove sensitive data before logging
    const sanitizedContents = envContents.replace(/=(.*)/g, '=***');
    console.log(sanitizedContents);
} else {
    console.log('.env file does not exist');
}

// Check current directory structure
console.log('\nCurrent directory structure:');
const currentFiles = fs.readdirSync(process.cwd());
console.log(currentFiles);

console.log('\n=== Test Complete ==='); 