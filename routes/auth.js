const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Check if JWT_SECRET is properly set
if (!process.env.JWT_SECRET) {
    console.error('Error: JWT_SECRET not set in environment variables.');
    process.exit(1); // Exit the application if JWT_SECRET is not set
}

// Set up multer for file uploads with file type validation
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Set the upload directory
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Save files with unique names
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed!'));
    }
});

// Input validation for registration
const validateRegistration = [
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long.'),
    body('email').isEmail().withMessage('Please enter a valid email address.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
    body('first_name').notEmpty().withMessage('First name is required.'),
    body('last_name').notEmpty().withMessage('Last name is required.')
];

// Register route
router.post('/register', upload.single('profile_image'), validateRegistration, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { username, first_name, last_name, email, nickname, website, telephone, mobile, bio, password } = req.body;
        const profile_image = req.file ? req.file.filename : null;

        // Check if the user already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or email already in use.' });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user with the hashed password
        const user = new User({
            username,
            first_name,
            last_name,
            email,
            nickname,
            website,
            telephone,
            mobile,
            bio,
            profile_image,
            password: hashedPassword
        });

        // Save the user to the database
        await user.save();
        console.log('User registered successfully:', user);

        // Respond with a success message
        res.status(201).send({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Error during user registration:', err);
        res.status(500).send({ message: 'Internal server error' });
    }
});

// Login route with input validation
router.post('/login', [
    body('username').notEmpty().withMessage('Username is required.'),
    body('password').notEmpty().withMessage('Password is required.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { username, password } = req.body;
        console.log('Login attempt with username:', username);

        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            console.warn('User not found:', username);
            return res.status(401).send({ message: 'Invalid credentials' });
        }
        console.log('User found:', user);

        // Compare the provided password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send({ message: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('JWT token generated:', token);

        // Respond with the token
        res.send({ token });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send({ message: 'Internal server error' });
    }
});

// Profile route to get the current user's information
router.get('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).send({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password'); // Exclude the password field
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        res.send(user);
    } catch (err) {
        console.error('Error retrieving user profile:', err);
        res.status(500).send({ message: 'Failed to retrieve user profile' });
    }
});

module.exports = router;
