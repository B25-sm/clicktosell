/**
 * Redis Session Middleware for OLX Classifieds
 * Handles user sessions, authentication, and caching
 */

const redisService = require('../config/redis');

// Session middleware
const redisSession = async (req, res, next) => {
  try {
    // Get session ID from cookie or Authorization header
    const sessionId = req.cookies?.sessionId || req.headers?.authorization?.replace('Bearer ', '');
    
    if (sessionId) {
      // Get session data from Redis
      const sessionData = await redisService.getSession(sessionId);
      
      if (sessionData) {
        req.session = sessionData;
        req.user = sessionData.user;
        
        // Update session expiry
        await redisService.setSession(sessionId, sessionData, 3600); // 1 hour
        
        // Set user online status
        if (sessionData.user?.id) {
          await redisService.setUserOnline(sessionData.user.id);
        }
      } else {
        // Session expired or invalid
        req.session = null;
        req.user = null;
      }
    } else {
      req.session = null;
      req.user = null;
    }
    
    next();
  } catch (error) {
    console.error('Redis Session Middleware Error:', error);
    req.session = null;
    req.user = null;
    next();
  }
};

// Cache middleware
const redisCache = (keyGenerator, ttl = 300) => {
  return async (req, res, next) => {
    try {
      const cacheKey = typeof keyGenerator === 'function' 
        ? keyGenerator(req) 
        : `${keyGenerator}:${req.params.id || req.query.page || 'default'}`;
      
      // Try to get from cache
      const cachedData = await redisService.getCache(cacheKey);
      
      if (cachedData) {
        console.log(`✅ Cache hit for key: ${cacheKey}`);
        return res.json({
          success: true,
          data: cachedData,
          cached: true,
          timestamp: new Date().toISOString()
        });
      }
      
      // Store original res.json method
      const originalJson = res.json;
      
      // Override res.json to cache the response
      res.json = function(data) {
        // Cache the response data
        if (data.success !== false) {
          redisService.setCache(cacheKey, data, ttl)
            .then(() => console.log(`✅ Cached response for key: ${cacheKey}`))
            .catch(err => console.error('Cache set error:', err));
        }
        
        // Call original method
        originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('Redis Cache Middleware Error:', error);
      next();
    }
  };
};

// Rate limiting middleware
const redisRateLimit = (limit = 100, window = 900) => {
  return async (req, res, next) => {
    try {
      const identifier = req.ip || req.headers['x-forwarded-for'] || 'unknown';
      const rateLimit = await redisService.checkRateLimit(identifier, limit, window);
      
      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': limit,
        'X-RateLimit-Remaining': rateLimit.remaining,
        'X-RateLimit-Reset': new Date(Date.now() + window * 1000).toISOString()
      });
      
      if (!rateLimit.allowed) {
        return res.status(429).json({
          success: false,
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${window} seconds.`,
          retryAfter: window
        });
      }
      
      next();
    } catch (error) {
      console.error('Redis Rate Limit Middleware Error:', error);
      next(); // Continue without rate limiting if Redis fails
    }
  };
};

// Authentication middleware
const requireAuth = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }
    
    // Check if user is still online
    const isOnline = await redisService.isUserOnline(req.user.id);
    if (!isOnline) {
      return res.status(401).json({
        success: false,
        error: 'Session expired',
        message: 'Your session has expired. Please log in again.'
      });
    }
    
    next();
  } catch (error) {
    console.error('Authentication Middleware Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Authentication check failed'
    });
  }
};

// Admin authentication middleware
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
        message: 'You do not have permission to access this resource'
      });
    }
    
    next();
  } catch (error) {
    console.error('Admin Authentication Middleware Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Search suggestions middleware
const trackSearch = async (req, res, next) => {
  try {
    const query = req.query.q || req.body.query;
    
    if (query && query.length > 2) {
      // Track search query for suggestions
      await redisService.addSearchSuggestion(query);
    }
    
    next();
  } catch (error) {
    console.error('Search Tracking Middleware Error:', error);
    next(); // Continue even if search tracking fails
  }
};

module.exports = {
  redisSession,
  redisCache,
  redisRateLimit,
  requireAuth,
  requireAdmin,
  trackSearch
};






