// Backend/server.js

require('dotenv').config(); // Load environment variables

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');  // Import the connectDB function

// Connect to Database
connectDB();  // Call the function to connect to MongoDB

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/cutting', require('./routes/cuttingRoutes'));
app.use('/api/stitching', require('./routes/stitchingRoutes'));
app.use('/api/quality', require('./routes/qualityRoutes'));

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
