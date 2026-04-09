require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./config/db');

// Import Routes
const medicineRoutes = require('./routes/medicineRoutes');
const trackingRoutes = require('./routes/trackingRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Use Render dynamic PORT
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Start Server Function
const startServer = async () => {
    try {
        // Initialize MongoDB
        await initDb();

        // Health Check Route
        app.get('/', (req, res) => {
            res.json({
                success: true,
                message: 'MediTrack API is running...'
            });
        });

        // API Routes
        app.use('/api/auth', authRoutes);
        app.use('/api/medicines', medicineRoutes);
        app.use('/api/tracking', trackingRoutes);

        // Error Handling Middleware
        app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).json({
                success: false,
                message: 'Internal Server Error'
            });
        });

        // Start Server
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Run Server
startServer();