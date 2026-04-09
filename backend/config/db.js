const mongoose = require('mongoose');
require('dotenv').config();

const initDb = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrack');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

const getDb = () => {
    return mongoose.connection;
};

module.exports = { initDb, getDb };
