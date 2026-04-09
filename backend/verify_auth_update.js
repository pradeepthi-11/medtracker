require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/userModel');

async function verify() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrack');
        console.log('DB Connected');
        
        const testEmail = `test_${Date.now()}@example.com`;
        const testName = 'Test User';
        
        console.log(`Attempting to create user: ${testName} (${testEmail})`);
        
        const user = new User({
            name: testName,
            email: testEmail,
            password: 'password123'
        });
        
        await user.save();
        console.log('✅ User created successfully with name field!');
        console.log('User data:', { id: user._id, name: user.name, email: user.email });
        
        // Clean up
        await User.deleteOne({ _id: user._id });
        console.log('Test user cleaned up.');
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Verification failed:', err.message);
        process.exit(1);
    }
}

verify();
