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
  try {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 1.0
    });
    
    // Sentry request handler must be the first middleware (Sentry v7 API)
    if (Sentry.Handlers && typeof Sentry.Handlers.requestHandler === 'function') {
      app.use(Sentry.Handlers.requestHandler());
    }
  } catch (error) {
    console.error('Failed to initialize Sentry:', error.message);
  }
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
// CORS configuration - Allow frontend connections
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      // Vercel domains (will be added via CORS_ORIGIN env var)
      'https://clicktosell.vercel.app',
      // Custom domains (add your actual domains here)
      'https://your-frontend-domain.com'
    ];
    
    // Add environment-specific origins
    if (process.env.CORS_ORIGIN) {
      const envOrigins = process.env.CORS_ORIGIN.split(',');
      allowedOrigins.push(...envOrigins);
    }
    
    // Check for Vercel and Render domains with wildcard matching
    const isVercelDomain = origin && origin.endsWith('.vercel.app');
    const isRenderDomain = origin && origin.endsWith('.onrender.com');
    const isAllowedOrigin = allowedOrigins.indexOf(origin) !== -1;
    
    if (isAllowedOrigin || isVercelDomain || isRenderDomain) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
};

app.use(cors(corsOptions));

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

// Health check endpoint (Render uses this for health checks)
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

// Render-specific health check (alternative endpoint)
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
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
  const { page = 1, limit = 10, category, location, search } = req.query;
  
  // Mock data with more variety
  const mockListings = [
    {
      id: '1',
      title: 'iPhone 13 Pro Max 256GB',
      price: 75000,
      location: 'Mumbai, Maharashtra',
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
      category: 'Electronics',
      description: 'Excellent condition, barely used iPhone 13 Pro Max with all original accessories.',
      createdAt: '2024-01-15T10:30:00Z',
      seller: {
        id: 'user1',
        name: 'John Doe',
        rating: 4.8
      }
    },
    {
      id: '2',
      title: 'MacBook Pro M2 14-inch',
      price: 120000,
      location: 'Delhi, NCR',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
      category: 'Electronics',
      description: 'MacBook Pro M2 chip, 16GB RAM, 512GB SSD. Perfect for professionals.',
      createdAt: '2024-01-14T15:45:00Z',
      seller: {
        id: 'user2',
        name: 'Jane Smith',
        rating: 4.9
      }
    },
    {
      id: '3',
      title: 'Samsung Galaxy S23 Ultra',
      price: 65000,
      location: 'Bangalore, Karnataka',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
      category: 'Electronics',
      description: 'Samsung Galaxy S23 Ultra with S Pen, 256GB storage.',
      createdAt: '2024-01-13T09:20:00Z',
      seller: {
        id: 'user3',
        name: 'Mike Johnson',
        rating: 4.7
      }
    },
    {
      id: '4',
      title: 'Sofa Set - 3+2+1',
      price: 25000,
      location: 'Pune, Maharashtra',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
      category: 'Furniture',
      description: 'Comfortable 3+2+1 sofa set in excellent condition.',
      createdAt: '2024-01-12T14:10:00Z',
      seller: {
        id: 'user4',
        name: 'Sarah Wilson',
        rating: 4.6
      }
    },
    {
      id: '5',
      title: 'Honda City 2020',
      price: 850000,
      location: 'Chennai, Tamil Nadu',
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400',
      category: 'Vehicles',
      description: 'Honda City 2020, single owner, well maintained, 25,000 km driven.',
      createdAt: '2024-01-11T11:30:00Z',
      seller: {
        id: 'user5',
        name: 'Raj Kumar',
        rating: 4.8
      }
    }
  ];

  // Filter by category if provided
  let filteredListings = mockListings;
  if (category) {
    filteredListings = mockListings.filter(listing => 
      listing.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Filter by location if provided
  if (location) {
    filteredListings = filteredListings.filter(listing => 
      listing.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  // Filter by search term if provided
  if (search) {
    const searchTerm = search.toLowerCase();
    filteredListings = filteredListings.filter(listing => 
      listing.title.toLowerCase().includes(searchTerm) ||
      listing.description.toLowerCase().includes(searchTerm)
    );
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedListings = filteredListings.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: {
      listings: paginatedListings,
      total: filteredListings.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(filteredListings.length / limit)
    }
  });
});

// Get single listing by ID
app.get('/api/v1/listings/:id', (req, res) => {
  const { id } = req.params;
  
  // Mock single listing data
  const mockListing = {
    id: id,
    title: 'iPhone 13 Pro Max 256GB',
    price: 75000,
    location: 'Mumbai, Maharashtra',
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'
    ],
    category: 'Electronics',
    description: 'Excellent condition, barely used iPhone 13 Pro Max with all original accessories. No scratches, battery health 98%. Comes with original box, charger, and documentation.',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    seller: {
      id: 'user1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+91 98765 43210',
      rating: 4.8,
      totalSales: 45,
      memberSince: '2022-03-15'
    },
    views: 156,
    favorites: 23,
    condition: 'Excellent',
    brand: 'Apple',
    model: 'iPhone 13 Pro Max'
  };

  res.json({
    success: true,
    data: mockListing
  });
});

// Create new listing
app.post('/api/v1/listings', (req, res) => {
  const listingData = req.body;
  
  // Validate required fields
  if (!listingData.title || !listingData.price || !listingData.category) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: title, price, category'
    });
  }

  // Mock created listing
  const newListing = {
    id: Date.now().toString(),
    ...listingData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    views: 0,
    favorites: 0
  };

  res.status(201).json({
    success: true,
    data: newListing,
    message: 'Listing created successfully'
  });
});

// Update listing
app.put('/api/v1/listings/:id', (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Mock updated listing
  const updatedListing = {
    id: id,
    ...updateData,
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    data: updatedListing,
    message: 'Listing updated successfully'
  });
});

// Delete listing
app.delete('/api/v1/listings/:id', (req, res) => {
  const { id } = req.params;

  res.json({
    success: true,
    message: 'Listing deleted successfully',
    data: { id }
  });
});

// Get categories
app.get('/api/v1/categories', (req, res) => {
  const categories = [
    { id: 'electronics', name: 'Electronics', icon: '📱', count: 1250 },
    { id: 'furniture', name: 'Furniture', icon: '🪑', count: 890 },
    { id: 'vehicles', name: 'Vehicles', icon: '🚗', count: 650 },
    { id: 'fashion', name: 'Fashion', icon: '👕', count: 2100 },
    { id: 'home-garden', name: 'Home & Garden', icon: '🏠', count: 750 },
    { id: 'sports', name: 'Sports', icon: '⚽', count: 420 },
    { id: 'books', name: 'Books', icon: '📚', count: 180 },
    { id: 'toys', name: 'Toys & Games', icon: '🎮', count: 320 }
  ];

  res.json({
    success: true,
    data: categories
  });
});

// Search listings
app.get('/api/v1/search', (req, res) => {
  const { q, category, location, minPrice, maxPrice, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
  
  // Mock search results
  const searchResults = {
    listings: [],
    total: 0,
    query: q,
    filters: {
      category,
      location,
      minPrice,
      maxPrice
    },
    sort: {
      by: sortBy,
      order: sortOrder
    }
  };

  res.json({
    success: true,
    data: searchResults
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
  if (Sentry.Handlers && typeof Sentry.Handlers.errorHandler === 'function') {
    app.use(Sentry.Handlers.errorHandler());
  }
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

// Import subscription routes
console.log('Loading subscription routes...');
try {
  const subscriptionRoutes = require('./routes/subscriptions');
  app.use('/api/v1/subscriptions', subscriptionRoutes);
  console.log('Subscription routes loaded successfully');
} catch (error) {
  console.error('Failed to load subscription routes:', error.message);
  console.error('Stack:', error.stack);
  // Continue without subscription routes for now
}

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

