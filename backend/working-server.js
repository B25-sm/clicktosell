const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

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
    environment: process.env.NODE_ENV || 'development',
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

// Email test endpoint
app.post('/api/v1/email/test-config', (req, res) => {
  const emailConfig = {
    service: process.env.EMAIL_SERVICE,
    user: process.env.EMAIL_USER,
    from: process.env.EMAIL_FROM
  };

  if (!emailConfig.service || !emailConfig.user) {
    return res.status(400).json({
      success: false,
      message: 'Email configuration missing',
      config: emailConfig
    });
  }

  res.json({
    success: true,
    message: 'Email configuration is valid',
    config: {
      service: emailConfig.service,
      user: emailConfig.user,
      from: emailConfig.from
    }
  });
});

// Payment test endpoint
app.post('/api/v1/payments/test/connection', (req, res) => {
  const paymentConfig = {
    razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET ? '***configured***' : 'missing'
  };

  if (!process.env.RAZORPAY_KEY_ID) {
    return res.status(400).json({
      success: false,
      message: 'Payment configuration missing',
      config: paymentConfig
    });
  }

  res.json({
    success: true,
    message: 'Payment configuration is valid',
    config: paymentConfig
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
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API endpoint: http://localhost:${PORT}/api/health`);
  console.log(`📱 Listings API: http://localhost:${PORT}/api/v1/listings`);
  console.log(`📧 Email test: http://localhost:${PORT}/api/v1/email/test-config`);
  console.log(`💳 Payment test: http://localhost:${PORT}/api/v1/payments/test/connection`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;





