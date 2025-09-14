// Load environment variables from .env file
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const enquiryRoutes = require('./routes/enquiry'); // Import the new enquiry route

const app = express();

// Middleware
const corsOptions = {
  // This allows your Vercel frontend to make requests to this backend
  origin: 'https://skill-network-app.vercel.app' 
};
app.use(cors(corsOptions));
app.use(express.json()); // To parse JSON bodies from requests

// Serve static files (HTML, CSS, JS) from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api', apiRoutes); // Handles requests for AI tools
app.use('/api', enquiryRoutes); // Handles requests for the enquiry form

// A catch-all route to handle page reloads on the client-side.
// This sends the main index.html for any request that doesn't match an API route.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// For Vercel's serverless environment, we export the app instance
module.exports = app;

