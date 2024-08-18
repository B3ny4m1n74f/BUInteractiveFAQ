const express = require('express');
const path = require('path');
const router = express.Router();

// Serve the index.html file for the root URL
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Serve the chat.html file
router.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/chat.html'));
});

// Serve the gpt-chat.html file
router.get('/gpt-chat', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/gpt-chat.html'));
});

// Serve the admin.html file
router.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// Serve the faq-management.html file (corrected to include the extension)
router.get('/faq-management', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/faq-management.html'));
});

// Serve the upload.html file
router.get('/upload', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/upload.html'));
});

// Serve the register.html file
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/register.html'));
});

module.exports = router;
