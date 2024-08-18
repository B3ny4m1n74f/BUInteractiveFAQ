const jwt = require('jsonwebtoken');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');

// Rate limiting middleware for the login route to prevent brute-force attacks
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 login attempts per windowMs
    message: 'Too many login attempts from this IP, please try again after 15 minutes.'
});

// Function to handle user login
exports.login = [
    loginLimiter,
    async (req, res) => {
        const { username, password } = req.body;
        try {
            // Find user by username
            const user = await User.findOne({ username });
            if (!user) {
                console.warn(`Login attempt with invalid username: ${username}`);
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            // Compare the provided password with the stored hash
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                console.warn(`Login attempt with invalid password for username: ${username}`);
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            // Generate JWT token with the user's ID and role
            const token = jwt.sign(
                { id: user._id, role: user.role }, // Including role for potential RBAC
                process.env.JWT_SECRET, // Use environment variable for secret
                { expiresIn: '1h', algorithm: 'HS256' } // Use secure algorithm
            );

            // Log successful login
            console.info(`User logged in: ${username}`);

            // Send the token in the response
            res.json({ token });
        } catch (error) {
            // Log any server errors for further investigation
            console.error('Login error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
];
