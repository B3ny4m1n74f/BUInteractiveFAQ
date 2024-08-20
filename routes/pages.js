const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Use compression middleware to gzip all responses
router.use(compression());

// Use helmet to set secure HTTP headers
router.use(helmet());

// Rate limiter middleware to limit repeated requests to the public endpoints
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests, please try again later.",
});

// Apply rate limiter to all requests
router.use(limiter);

// Helper function to serve static HTML files
function serveStaticFile(route, file) {
    router.get(route, (req, res) => {  // `next` removed here
        const filePath = path.join(__dirname, '../public', file);
        res.sendFile(filePath, (err) => {
            if (err) {
                console.error(`Error serving ${file}:`, err);
                res.status(500).send('Internal Server Error');
            }
        });
    });
}

// Define routes using the helper function
serveStaticFile('/', 'index.html');
serveStaticFile('/chat', 'chat.html');
serveStaticFile('/gpt-chat', 'gpt-chat.html');
serveStaticFile('/admin', 'admin.html');
serveStaticFile('/faq-management', 'faq-management.html');
serveStaticFile('/upload', 'upload.html');
serveStaticFile('/register', 'register.html');

module.exports = router;
