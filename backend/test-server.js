const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = 5000; // Hard-coded port to avoid environment issues

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'OLX Classifieds API Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: 'development',
    version: '1.0.0'
  });
});

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
});

// Sample listings endpoint
app.get('/api/v1/listings', (req, res) => {
  const sampleListings = [
    {
      id: "1",
      title: "iPhone 13 Pro",
      price: 50000,
      location: "Mumbai",
      image: "https://via.placeholder.com/300x200",
      category: "Electronics"
    },
    {
      id: "2",
      title: "Samsung Galaxy S21",
      price: 45000,
      location: "Delhi",
      image: "https://via.placeholder.com/300x200",
      category: "Electronics"
    },
    {
      id: "3",
      title: "MacBook Pro M1",
      price: 120000,
      location: "Bangalore",
      image: "https://via.placeholder.com/300x200",
      category: "Electronics"
    }
  ];

  res.json({
    success: true,
    data: {
      listings: sampleListings,
      total: sampleListings.length
    }
  });
});

// Default route
app.get('/', (req, res) => {
  res.json({
    message: 'OLX Classifieds API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api/health',
      listings: '/api/v1/listings'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API endpoint: http://localhost:${PORT}/api/health`);
  console.log(`📱 Listings API: http://localhost:${PORT}/api/v1/listings`);
});

module.exports = app;