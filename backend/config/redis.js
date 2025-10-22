/**
 * Redis Configuration for OLX Classifieds
 * Handles caching, sessions, and real-time data
 */

const { createClient } = require('redis');

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          connectTimeout: 10000, // 10 seconds
          lazyConnect: true,
          reconnectStrategy: (retries) => {
            if (retries > 20) {
              return new Error('Redis connection retries exhausted');
            }
            return Math.min(retries * 50, 2000); // Exponential backoff, max 2 seconds
          },
          keepAlive: 30000, // 30 seconds
          family: 4 // Use IPv4
        },
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            return new Error('Redis server connection refused');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Retry time exhausted');
          }
          if (options.attempt > 20) {
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('✅ Redis connected successfully');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        console.log('⚠️ Redis disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
      return this.client;
    } catch (error) {
      console.error('❌ Redis connection failed:', error.message);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  // Session Management
  async setSession(sessionId, sessionData, ttl = 3600) {
    if (!this.isConnected) throw new Error('Redis not connected');
    
    const key = `session:${sessionId}`;
    await this.client.setEx(key, ttl, JSON.stringify(sessionData));
  }

  async getSession(sessionId) {
    if (!this.isConnected) throw new Error('Redis not connected');
    
    const key = `session:${sessionId}`;
    const session = await this.client.get(key);
    return session ? JSON.parse(session) : null;
  }

  async deleteSession(sessionId) {
    if (!this.isConnected) throw new Error('Redis not connected');
    
    const key = `session:${sessionId}`;
    await this.client.del(key);
  }

  // Caching
  async setCache(key, data, ttl = 300) {
    if (!this.isConnected) throw new Error('Redis not connected');
    
    const cacheKey = `cache:${key}`;
    await this.client.setEx(cacheKey, ttl, JSON.stringify(data));
  }

  async getCache(key) {
    if (!this.isConnected) throw new Error('Redis not connected');
    
    const cacheKey = `cache:${key}`;
    const data = await this.client.get(cacheKey);
    return data ? JSON.parse(data) : null;
  }

  async deleteCache(key) {
    if (!this.isConnected) throw new Error('Redis not connected');
    
    const cacheKey = `cache:${key}`;
    await this.client.del(cacheKey);
  }

  // Rate Limiting - Optimized for high throughput
  async checkRateLimit(identifier, limit = 1000, window = 900) {
    if (!this.isConnected) throw new Error('Redis not connected');
    
    const key = `rate_limit:${identifier}`;
    const current = await this.client.incr(key);
    
    if (current === 1) {
      await this.client.expire(key, window);
    }
    
    return {
      allowed: current <= limit,
      count: current,
      remaining: Math.max(0, limit - current)
    };
  }

  // Advanced rate limiting with sliding window
  async checkSlidingWindowRateLimit(identifier, limit = 1000, window = 60) {
    if (!this.isConnected) throw new Error('Redis not connected');
    
    const now = Date.now();
    const key = `sliding_rate_limit:${identifier}`;
    
    // Remove old entries
    await this.client.zremrangebyscore(key, 0, now - window * 1000);
    
    // Count current entries
    const current = await this.client.zcard(key);
    
    if (current < limit) {
      // Add current request
      await this.client.zadd(key, now, `${now}-${Math.random()}`);
      await this.client.expire(key, window);
      
      return {
        allowed: true,
        count: current + 1,
        remaining: limit - current - 1
      };
    }
    
    return {
      allowed: false,
      count: current,
      remaining: 0
    };
  }

  // Real-time Features
  async publishMessage(channel, message) {
    if (!this.isConnected) throw new Error('Redis not connected');
    
    await this.client.publish(channel, JSON.stringify(message));
  }

  async subscribeToChannel(channel, callback) {
    if (!this.isConnected) throw new Error('Redis not connected');
    
    const subscriber = this.client.duplicate();
    await subscriber.connect();
    
    await subscriber.subscribe(channel, (message) => {
      callback(JSON.parse(message));
    });
    
    return subscriber;
  }

  // User Online Status
  async setUserOnline(userId) {
    if (!this.isConnected) throw new Error('Redis not connected');
    
    const key = `user:online:${userId}`;
    await this.client.setEx(key, 300, new Date().toISOString()); // 5 minutes
  }

  async isUserOnline(userId) {
    if (!this.isConnected) throw new Error('Redis not connected');
    
    const key = `user:online:${userId}`;
    return await this.client.exists(key);
  }

  // Search Suggestions
  async addSearchSuggestion(query) {
    if (!this.isConnected) throw new Error('Redis not connected');
    
    const key = 'search:suggestions';
    await this.client.zincrby(key, 1, query.toLowerCase());
    await this.client.zremrangebyrank(key, 0, -100); // Keep top 100
  }

  async getSearchSuggestions(prefix, limit = 10) {
    if (!this.isConnected) throw new Error('Redis not connected');
    
    const key = 'search:suggestions';
    const suggestions = await this.client.zrevrangebyscore(key, '+inf', '-inf', 'LIMIT', 0, limit);
    return suggestions.filter(s => s.startsWith(prefix.toLowerCase()));
  }

  // Health Check
  async ping() {
    if (!this.isConnected) throw new Error('Redis not connected');
    
    return await this.client.ping();
  }

  // Get Redis Info
  async getInfo() {
    if (!this.isConnected) throw new Error('Redis not connected');
    
    return await this.client.info();
  }
}

// Create singleton instance
const redisService = new RedisService();

module.exports = redisService;



