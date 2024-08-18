require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const app = express();

// Middleware for security and request logging
app.use(helmet());
app.use(morgan('combined'));

// Middleware for parsing JSON payloads and enabling CORS
app.use(express.json());
app.use(cors());

// Serve static files from the public and uploads directories
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting to prevent brute-force attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Connect to MongoDB using the connection string from environment variables
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit the process if the database connection fails
    });

// Importing routes
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');

// Route handling
app.use('/auth', authRoutes);
app.use('/questions', questionRoutes);

// Import and use OpenAI routes with error handling
try {
    const gptChatRoutes = require('./routes/openai');
    app.use('/openai', gptChatRoutes);
} catch (error) {
    console.error('Error loading OpenAI routes:', error);
}

// Serve static HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

app.get('/gpt-chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'gpt-chat.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/faq-management', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'faq-management.html'));
});

app.get('/upload', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack);
    res.status(500).send('Something went wrong!');
});

// Graceful shutdown for handling process termination
process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
    });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
