require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
    try {
        console.log('Attempting to connect to:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrack');
        console.log('✅ MongoDB connection successful!');
        
        // Test models
        const Medicine = require('./models/medicineModel');
        const Tracking = require('./models/trackingModel');
        
        console.log('Testing models...');
        const count = await mongoose.model('Medicine').countDocuments();
        console.log(`Current medicine count: ${count}`);
        
        process.exit(0);
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1);
    }
}

testConnection();
