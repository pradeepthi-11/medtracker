require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/userModel');
const bcrypt = require('bcryptjs');

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrack');
        console.log('DB Connected');
        
        console.log('User model:', typeof User);
        console.log('User.create function:', typeof User.create);
        
        const salt = await bcrypt.genSalt(10);
        console.log('Bcrypt salt:', salt);
        
        const hashed = await bcrypt.hash('testpassword', salt);
        console.log('Bcrypt hash:', hashed);
        
        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err);
        process.exit(1);
    }
}

test();
