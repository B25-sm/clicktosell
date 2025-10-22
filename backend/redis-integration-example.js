/**
 * Redis Integration Example for OLX Classifieds Backend
 * This shows how to integrate Redis with your existing server
 */

const express = require('express');
const redisService = require('./config/redis');
const realTimeService = require('./services/redisService');
const { redisSession, redisCache, redisRateLimit, requireAuth } = require('./middleware/redisSession');

const app = express();

// Initialize Redis connection
async function initializeRedis() {
  try {
    await redisService.connect();
    console.log('✅ Redis initialized successfully');
  } catch (error) {
    console.error('❌ Redis initialization failed:', error);
  }
}

// Initialize Redis on startup
initializeRedis();

// Middleware
app.use(express.json());
app.use(redisSession);
app.use(redisRateLimit(100, 900)); // 100 requests per 15 minutes

// Example routes with Redis integration

// 1. Session Management
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Authenticate user (your existing logic)
    const user = await authenticateUser(email, password);
    
    if (user) {
      // Create session
      const sessionId = generateSessionId();
      const sessionData = {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        loginTime: new Date().toISOString()
      };
      
      // Store session in Redis
      await redisService.setSession(sessionId, sessionData, 3600); // 1 hour
      
      // Set user online
      await redisService.setUserOnline(user.id);
      
      res.cookie('sessionId', sessionId, { httpOnly: true, maxAge: 3600000 });
      res.json({
        success: true,
        message: 'Login successful',
        user: user,
        sessionId: sessionId
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// 2. Cached API endpoints
app.get('/api/listings', redisCache('listings', 300), async (req, res) => {
  try {
    // Your existing logic to fetch listings
    const listings = await fetchListings(req.query);
    
    res.json({
      success: true,
      data: listings,
      count: listings.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch listings'
    });
  }
});

// 3. Real-time chat
app.post('/api/chat/:chatId/messages', requireAuth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;
    
    const chatMessage = await realTimeService.sendChatMessage(
      chatId, 
      message, 
      req.user.id
    );
    
    res.json({
      success: true,
      data: chatMessage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

app.get('/api/chat/:chatId/messages', requireAuth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await realTimeService.getChatMessages(chatId);
    
    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
});

// 4. Notifications
app.get('/api/notifications', requireAuth, async (req, res) => {
  try {
    const notifications = await realTimeService.getUserNotifications(req.user.id);
    
    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

app.post('/api/notifications/:notificationId/read', requireAuth, async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    await realTimeService.markNotificationAsRead(req.user.id, notificationId);
    
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

// 5. User presence
app.post('/api/presence', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    
    await realTimeService.setUserPresence(req.user.id, status);
    
    res.json({
      success: true,
      message: 'Presence updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update presence'
    });
  }
});

app.get('/api/presence/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const presence = await realTimeService.getUserPresence(userId);
    
    res.json({
      success: true,
      data: presence
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch presence'
    });
  }
});

// 6. Search with analytics
app.get('/api/search', trackSearch, async (req, res) => {
  try {
    const { q } = req.query;
    
    // Track search query
    await realTimeService.trackSearch(q, req.user?.id);
    
    // Your existing search logic
    const results = await searchListings(q);
    
    res.json({
      success: true,
      data: results,
      query: q
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Search failed'
    });
  }
});

app.get('/api/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    const suggestions = await realTimeService.getPopularSearches(10);
    
    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch suggestions'
    });
  }
});

// 7. Listing views tracking
app.post('/api/listings/:listingId/view', async (req, res) => {
  try {
    const { listingId } = req.params;
    
    await realTimeService.updateListingViews(listingId);
    
    const views = await realTimeService.getListingViews(listingId);
    
    res.json({
      success: true,
      data: { views }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to track view'
    });
  }
});

// 8. Health check
app.get('/api/health', async (req, res) => {
  try {
    const redisStatus = await redisService.ping();
    
    res.json({
      success: true,
      services: {
        redis: redisStatus === 'PONG' ? 'healthy' : 'unhealthy',
        mongodb: 'healthy', // Add your MongoDB health check
        api: 'healthy'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed'
    });
  }
});

// Helper functions (implement these based on your existing code)
async function authenticateUser(email, password) {
  // Your existing authentication logic
  return null; // Placeholder
}

function generateSessionId() {
  return require('crypto').randomBytes(32).toString('hex');
}

async function fetchListings(query) {
  // Your existing listings fetch logic
  return []; // Placeholder
}

async function searchListings(query) {
  // Your existing search logic
  return []; // Placeholder
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await redisService.disconnect();
  await realTimeService.cleanup();
  process.exit(0);
});

module.exports = app;






