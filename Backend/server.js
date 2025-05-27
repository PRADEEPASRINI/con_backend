// Backend/server.js

require('dotenv').config(); // Load environment variables

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');  // Import the connectDB function
const mongoose = require('mongoose');

// Express app initialization
const app = express();

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true
}));

// CRITICAL FIX: Add body parsing middleware BEFORE routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.method === 'PUT' || req.method === 'POST') {
    console.log('Request body:', req.body);
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// MongoDB connection status endpoint
app.get('/api/db-status', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.status(200).json({ 
    status: states[dbState],
    connected: dbState === 1
  });
});

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Routes - MAKE SURE these come after middleware
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/cutting', require('./routes/cuttingRoutes'));
app.use('/api/stitching', require('./routes/stitchingRoutes'));
app.use('/api/quality', require('./routes/qualityRoutes'));

// Test route for debugging
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working', timestamp: new Date().toISOString() });
});

// Handle 404s for undefined routes
app.use((req, res) => {
  console.log('404 - Route not found:', req.method, req.url);
  res.status(404).json({ message: 'Endpoint not found', url: req.url, method: req.method });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  console.error('Error stack:', err.stack);
  res.status(500).json({ 
    message: err.message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB()
  .then(() => {
    // Start server only after successful DB connection
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check available at http://localhost:${PORT}/api/health`);
      console.log(`Test endpoint available at http://localhost:${PORT}/api/test`);
      console.log(`Database status at http://localhost:${PORT}/api/db-status`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });