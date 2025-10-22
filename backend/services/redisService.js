/**
 * Redis Service for Real-time Features
 * Handles chat, notifications, and live updates
 */

const redisService = require('../config/redis');

class RealTimeService {
  constructor() {
    this.subscribers = new Map();
  }

  // Chat functionality
  async sendChatMessage(chatId, message, senderId) {
    try {
      const chatMessage = {
        id: Date.now().toString(),
        chatId,
        senderId,
        message: message.content,
        timestamp: new Date().toISOString(),
        type: message.type || 'text'
      };

      // Store message in Redis
      const messageKey = `chat:${chatId}:messages`;
      await redisService.client.lpush(messageKey, JSON.stringify(chatMessage));
      
      // Keep only last 100 messages
      await redisService.client.ltrim(messageKey, 0, 99);
      
      // Publish to chat channel
      await redisService.publishMessage(`chat:${chatId}`, {
        type: 'new_message',
        data: chatMessage
      });

      // Update chat metadata
      await redisService.client.hset(`chat:${chatId}:meta`, {
        lastMessage: chatMessage.message,
        lastMessageTime: chatMessage.timestamp,
        lastSenderId: senderId
      });

      return chatMessage;
    } catch (error) {
      console.error('Send chat message error:', error);
      throw error;
    }
  }

  async getChatMessages(chatId, limit = 50) {
    try {
      const messageKey = `chat:${chatId}:messages`;
      const messages = await redisService.client.lrange(messageKey, 0, limit - 1);
      
      return messages.map(msg => JSON.parse(msg)).reverse();
    } catch (error) {
      console.error('Get chat messages error:', error);
      throw error;
    }
  }

  // User presence
  async setUserPresence(userId, status = 'online') {
    try {
      const presenceKey = `presence:${userId}`;
      const presenceData = {
        status,
        lastSeen: new Date().toISOString(),
        timestamp: Date.now()
      };

      await redisService.client.setEx(presenceKey, 300, JSON.stringify(presenceData)); // 5 minutes
      
      // Publish presence update
      await redisService.publishMessage('presence:updates', {
        type: 'user_presence',
        userId,
        data: presenceData
      });

      return presenceData;
    } catch (error) {
      console.error('Set user presence error:', error);
      throw error;
    }
  }

  async getUserPresence(userId) {
    try {
      const presenceKey = `presence:${userId}`;
      const presence = await redisService.client.get(presenceKey);
      
      return presence ? JSON.parse(presence) : { status: 'offline', lastSeen: null };
    } catch (error) {
      console.error('Get user presence error:', error);
      return { status: 'offline', lastSeen: null };
    }
  }

  // Notifications
  async sendNotification(userId, notification) {
    try {
      const notificationData = {
        id: Date.now().toString(),
        userId,
        title: notification.title,
        message: notification.message,
        type: notification.type || 'info',
        data: notification.data || {},
        timestamp: new Date().toISOString(),
        read: false
      };

      // Store notification
      const notificationKey = `notifications:${userId}`;
      await redisService.client.lpush(notificationKey, JSON.stringify(notificationData));
      
      // Keep only last 100 notifications
      await redisService.client.ltrim(notificationKey, 0, 99);
      
      // Publish notification
      await redisService.publishMessage(`notifications:${userId}`, {
        type: 'new_notification',
        data: notificationData
      });

      return notificationData;
    } catch (error) {
      console.error('Send notification error:', error);
      throw error;
    }
  }

  async getUserNotifications(userId, limit = 20) {
    try {
      const notificationKey = `notifications:${userId}`;
      const notifications = await redisService.client.lrange(notificationKey, 0, limit - 1);
      
      return notifications.map(notif => JSON.parse(notif));
    } catch (error) {
      console.error('Get user notifications error:', error);
      return [];
    }
  }

  async markNotificationAsRead(userId, notificationId) {
    try {
      const notificationKey = `notifications:${userId}`;
      const notifications = await redisService.client.lrange(notificationKey, 0, -1);
      
      for (let i = 0; i < notifications.length; i++) {
        const notif = JSON.parse(notifications[i]);
        if (notif.id === notificationId) {
          notif.read = true;
          await redisService.client.lset(notificationKey, i, JSON.stringify(notif));
          break;
        }
      }
    } catch (error) {
      console.error('Mark notification as read error:', error);
      throw error;
    }
  }

  // Live listing updates
  async updateListingViews(listingId) {
    try {
      const viewsKey = `listing:${listingId}:views`;
      await redisService.client.incr(viewsKey);
      
      // Publish view update
      await redisService.publishMessage(`listing:${listingId}`, {
        type: 'view_update',
        listingId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Update listing views error:', error);
    }
  }

  async getListingViews(listingId) {
    try {
      const viewsKey = `listing:${listingId}:views`;
      const views = await redisService.client.get(viewsKey);
      return parseInt(views) || 0;
    } catch (error) {
      console.error('Get listing views error:', error);
      return 0;
    }
  }

  // Search analytics
  async trackSearch(searchQuery, userId = null) {
    try {
      const searchKey = 'search:analytics';
      const searchData = {
        query: searchQuery,
        userId,
        timestamp: new Date().toISOString()
      };

      await redisService.client.lpush(searchKey, JSON.stringify(searchData));
      await redisService.client.ltrim(searchKey, 0, 999); // Keep last 1000 searches
      
      // Update search suggestions
      await redisService.addSearchSuggestion(searchQuery);
    } catch (error) {
      console.error('Track search error:', error);
    }
  }

  async getPopularSearches(limit = 10) {
    try {
      const suggestions = await redisService.getSearchSuggestions('', limit);
      return suggestions;
    } catch (error) {
      console.error('Get popular searches error:', error);
      return [];
    }
  }

  // Real-time subscriptions
  async subscribeToUserUpdates(userId, callback) {
    try {
      const subscriber = await redisService.subscribeToChannel(`notifications:${userId}`, callback);
      this.subscribers.set(`user:${userId}`, subscriber);
      return subscriber;
    } catch (error) {
      console.error('Subscribe to user updates error:', error);
      throw error;
    }
  }

  async subscribeToChat(chatId, callback) {
    try {
      const subscriber = await redisService.subscribeToChannel(`chat:${chatId}`, callback);
      this.subscribers.set(`chat:${chatId}`, subscriber);
      return subscriber;
    } catch (error) {
      console.error('Subscribe to chat error:', error);
      throw error;
    }
  }

  async unsubscribeFromChannel(channelKey) {
    try {
      const subscriber = this.subscribers.get(channelKey);
      if (subscriber) {
        await subscriber.quit();
        this.subscribers.delete(channelKey);
      }
    } catch (error) {
      console.error('Unsubscribe from channel error:', error);
    }
  }

  // Cleanup
  async cleanup() {
    try {
      for (const [key, subscriber] of this.subscribers) {
        await subscriber.quit();
      }
      this.subscribers.clear();
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
}

module.exports = new RealTimeService();






