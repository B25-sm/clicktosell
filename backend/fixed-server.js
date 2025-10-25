const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const Sentry = require('@sentry/node');

const app = express();

// Initialize Sentry only if DSN is provided and valid
if (process.env.SENTRY_DSN && process.env.SENTRY_DSN !== 'your_sentry_dsn_for_error_tracking' && process.env.SENTRY_DSN.startsWith('http')) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0
  });
  
  // Sentry request handler must be the first middleware
  app.use(Sentry.Handlers.requestHandler());
}

// Parse PORT safely, ensuring it's a number
let PORT = 5000; // Default port
if (process.env.PORT) {
  const parsedPort = parseInt(process.env.PORT, 10);
  if (!isNaN(parsedPort) && parsedPort > 0 && parsedPort < 65536) {
    PORT = parsedPort;
  }
}
console.log('Environment PORT:', process.env.PORT);
console.log('Using PORT:', PORT);

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Rate limiting - Optimized for 10k daily users
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for high traffic)
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/api/health';
  }
});
app.use('/api/', limiter);

// Body parsing middleware - Optimized for production
app.use(express.json({ 
  limit: '50mb', // Increased for large file uploads
  verify: (req, res, buf) => {
    // Store raw body for webhook verification
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '50mb',
  parameterLimit: 10000 // Increased parameter limit
}));

// Trust proxy for accurate IP addresses behind load balancer
app.set('trust proxy', 1);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'OLX Classifieds API Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API is working',
    timestamp: new Date().toISOString()
  });
});

// Mock API endpoints for testing
app.get('/api/v1/listings', (req, res) => {
  res.json({
    success: true,
    data: {
      listings: [
        {
          id: '1',
          title: 'iPhone 13 Pro',
          price: 50000,
          location: 'Mumbai',
          image: 'https://via.placeholder.com/300x200',
          category: 'Electronics'
        },
        {
          id: '2',
          title: 'Samsung Galaxy S21',
          price: 45000,
          location: 'Delhi',
          image: 'https://via.placeholder.com/300x200',
          category: 'Electronics'
        }
      ],
      total: 2
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

// Debug route to test Sentry error capture (use only in non-production environments)
app.get('/debug-sentry', () => {
  throw new Error('Sentry debug test error');
});

// Start server
// Sentry error handler must be before any other error middleware (only if Sentry is initialized)
if (process.env.SENTRY_DSN && process.env.SENTRY_DSN !== 'your_sentry_dsn_for_error_tracking' && process.env.SENTRY_DSN.startsWith('http')) {
  app.use(Sentry.Handlers.errorHandler());
}

// Optional fallback error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
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

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API endpoint: http://localhost:${PORT}/api/health`);
  console.log(`📱 Listings API: http://localhost:${PORT}/api/v1/listings`);
});

module.exports = app;
