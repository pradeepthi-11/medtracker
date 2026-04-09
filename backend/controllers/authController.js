const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'meditrack_secret_123', {
        expiresIn: '30d'
    });
};

const authController = {
    register: async (req, res) => {
        try {
            console.log('[Auth] Registration request:', req.body);
            const { name, email, password } = req.body;
            
            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'User already exists' });
            }

            console.log('[Auth] Creating user document...');
            const user = new User({ name, email, password });
            await user.save();
            console.log('[Auth] User created successfully:', user._id);
            
            res.status(201).json({
                success: true,
                data: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    token: generateToken(user._id)
                }
            });
        } catch (error) {
            console.error('Registration error stack:', error.stack);
            res.status(500).json({ success: false, message: 'Server Error during registration', error: error.message });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }

            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }

            res.json({
                success: true,
                data: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    token: generateToken(user._id)
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ success: false, message: 'Server Error during login' });
        }
    },

    getMe: async (req, res) => {
        try {
            const user = await User.findById(req.user.id).select('-password');
            res.json({ success: true, data: user });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    }
};

module.exports = authController;
