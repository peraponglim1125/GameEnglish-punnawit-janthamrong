const express = require('express');
const path = require('path');

const app = express();

// Serve static frontend files from public folder
app.use(express.static(path.join(__dirname, '../public')));

// Favicon handler
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Fallback to index.html for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;
