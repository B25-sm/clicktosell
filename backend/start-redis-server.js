/**
 * Redis-Integrated OLX Server
 * Simplified version to test Redis integration
 */

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Import Redis services
const redisService = require('./config/redis');
const realTimeService = require('./services/redisService');
const { redisSession, redisCache, redisRateLimit } = require('./middleware/redisSession');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Redis middleware
app.use('/api/', redisRateLimit(100, 900)); // 100 requests per 15 minutes
app.use(redisSession);

// Initialize services
async function initializeServices() {
  try {
    console.log('🚀 Initializing services...');
    
    // MongoDB connection
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/olx-classifieds');
    console.log('✅ MongoDB connected');
    
    // Redis connection
    await redisService.connect();
    console.log('✅ Redis connected');
    
    console.log('🎉 All services initialized successfully!');
  } catch (error) {
    console.error('❌ Service initialization failed:', error.message);
    process.exit(1);
  }
}

// Health check with Redis status
app.get('/health', async (req, res) => {
  try {
    const redisStatus = await redisService.ping();
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        redis: redisStatus === 'PONG' ? 'connected' : 'disconnected'
      }
    });
  } catch (error) {
    res.json({
      status: 'OK',
      services: {
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        redis: 'error'
      },
      error: error.message
    });
  }
});

// Test Redis operations
app.get('/api/test/redis', async (req, res) => {
  try {
    // Test caching
    await redisService.setCache('test:cache', { message: 'Redis caching works!', timestamp: new Date().toISOString() }, 60);
    const cached = await redisService.getCache('test:cache');
    
    // Test session
    await redisService.setSession('test-session', { userId: '123', name: 'Test User' }, 300);
    const session = await redisService.getSession('test-session');
    
    // Test real-time features
    await realTimeService.updateListingViews('test-listing');
    const views = await realTimeService.getListingViews('test-listing');
    
    res.json({
      success: true,
      message: 'All Redis features working!',
      data: {
        cache: cached,
        session: session,
        views: views,
        redisStatus: await redisService.ping()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Cached listings endpoint
app.get('/api/listings/featured', redisCache('featured-listings', 300), async (req, res) => {
  try {
    // Simulate fetching featured listings
    const featuredListings = [
      {
        id: '1',
        title: 'iPhone 13 Pro',
        price: 45000,
        location: 'Mumbai',
        image: 'https://via.placeholder.com/300x200',
        views: await realTimeService.getListingViews('1')
      },
      {
        id: '2',
        title: 'MacBook Pro M2',
        price: 120000,
        location: 'Delhi',
        image: 'https://via.placeholder.com/300x200',
        views: await realTimeService.getListingViews('2')
      },
      {
        id: '3',
        title: 'Honda City',
        price: 850000,
        location: 'Bangalore',
        image: 'https://via.placeholder.com/300x200',
        views: await realTimeService.getListingViews('3')
      }
    ];
    
    res.json({
      success: true,
      data: featuredListings,
      cached: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured listings'
    });
  }
});

// Real-time view tracking
app.post('/api/listings/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Update view count in Redis
    await realTimeService.updateListingViews(id);
    const views = await realTimeService.getListingViews(id);
    
    res.json({
      success: true,
      data: { views },
      message: 'View tracked successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to track view'
    });
  }
});

// Get view count
app.get('/api/listings/:id/views', async (req, res) => {
  try {
    const { id } = req.params;
    const views = await realTimeService.getListingViews(id);
    
    res.json({
      success: true,
      data: { views }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get view count'
    });
  }
});

// Cache management
app.get('/api/cache/stats', async (req, res) => {
  try {
    const info = await redisService.getInfo();
    res.json({
      success: true,
      data: {
        connected: redisService.isConnected,
        info: info ? 'Redis info available' : 'Redis info not available'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get cache stats'
    });
  }
});

// Default route
app.get('/', (req, res) => {
  res.json({
    message: 'OLX Classifieds API with Redis Integration',
    version: '1.0.0',
    features: [
      'Redis Caching',
      'Session Management',
      'Real-time View Tracking',
      'Rate Limiting',
      'Performance Optimization'
    ],
    endpoints: {
      health: '/health',
      redisTest: '/api/test/redis',
      featuredListings: '/api/listings/featured',
      viewTracking: '/api/listings/:id/view (POST)',
      viewCount: '/api/listings/:id/views',
      cacheStats: '/api/cache/stats'
    }
  });
});

// Error handling
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
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Graceful shutdown
async function gracefulShutdown(signal) {
  console.log(`\n${signal} received, shutting down gracefully...`);
  
  try {
    await redisService.disconnect();
    console.log('✅ Redis disconnected');
    
    await realTimeService.cleanup();
    console.log('✅ Real-time services cleaned up');
    
    await mongoose.connection.close();
    console.log('✅ MongoDB disconnected');
    
    console.log('👋 Server shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Shutdown error:', error);
    process.exit(1);
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Start server
async function startServer() {
  try {
    await initializeServices();
    
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🧪 Redis test: http://localhost:${PORT}/api/test/redis`);
      console.log(`📋 Featured listings: http://localhost:${PORT}/api/listings/featured`);
      console.log(`\n✨ Redis integration is live and ready!\n`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
}

startServer();






