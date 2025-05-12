const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/digital-asset-archive')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/assets', require('./routes/assetRoutes'));
app.use('/api/users', require('./routes/users'));
const fileRoutes = require('./routes/fileRoutes');
app.use('/api/files', fileRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Digital Assets Management API',
    status: 'Active',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      assets: '/api/assets',
      users: '/api/users',
      files: '/api/files'
    }
  });
});

// List all registered routes
console.log('Registered Routes:');
app._router.stack.forEach(function(r){
    if (r.route && r.route.path){
        console.log(`${Object.keys(r.route.methods)} ${r.route.path}`);
    } else if (r.name === 'router') {
        r.handle.stack.forEach(function(r){
            if (r.route && r.route.path){
                console.log(`${Object.keys(r.route.methods)} /api/files${r.route.path}`);
            }
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app; 