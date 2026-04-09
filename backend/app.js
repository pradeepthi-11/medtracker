require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./config/db');

// Import Routes
const medicineRoutes = require('./routes/medicineRoutes');
const trackingRoutes = require('./routes/trackingRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5005;

// Middleware
app.use(cors());
app.use(express.json());

// Main Initialization
const startServer = async () => {
    try {
        await initDb();

        // Root Health Check
        app.get('/', (req, res) => {
            res.json({ success: true, message: 'MediTrack API is running...' });
        });

        // Routes
        app.use('/api/auth', authRoutes);
        app.use('/api/medicines', medicineRoutes);
        app.use('/api/tracking', trackingRoutes);

        // Error Handling
        app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).send({ success: false, message: 'Internal Server Error' });
        });

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
            setInterval(() => {}, 100000); // keep alive
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
