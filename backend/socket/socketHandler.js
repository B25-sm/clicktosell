const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Listing = require('../models/Listing');
const logger = require('../utils/logger');

// Store active connections
const activeConnections = new Map();

// Authentication middleware for socket connections
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return next(new Error('User not found'));
    }

    if (user.status !== 'active') {
      return next(new Error('Account is not active'));
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    logger.error('Socket authentication failed:', error);
    next(new Error('Authentication failed'));
  }
};

// Main socket handler
const socketHandler = (io, socket) => {
  logger.socket('User connected', { 
    userId: socket.userId, 
    socketId: socket.id 
  });

  // Store connection
  activeConnections.set(socket.userId, {
    socketId: socket.id,
    user: socket.user,
    connectedAt: new Date(),
    lastActivity: new Date()
  });

  // Update user's last active status
  socket.user.updateLastActive();

  // Join user to their personal room
  socket.join(`user_${socket.userId}`);

  // Handle joining chat rooms
  socket.on('join_chat', async (data) => {
    try {
      const { chatId } = data;
      
      // Verify user is participant in this chat
      const chat = await Chat.findById(chatId);
      if (!chat || !chat.isParticipant(socket.userId)) {
        socket.emit('error', { message: 'Access denied to this chat' });
        return;
      }

      // Join chat room
      socket.join(`chat_${chatId}`);
      
      // Mark messages as read
      await chat.markAsRead(socket.userId);
      
      // Notify other participants that user is online in this chat
      socket.to(`chat_${chatId}`).emit('user_joined_chat', {
        userId: socket.userId,
        userName: socket.user.firstName
      });

      socket.emit('joined_chat', { chatId });
      
      logger.socket('User joined chat', { 
        userId: socket.userId, 
        chatId 
      });

    } catch (error) {
      logger.error('Join chat error:', error);
      socket.emit('error', { message: 'Failed to join chat' });
    }
  });

  // Handle leaving chat rooms
  socket.on('leave_chat', (data) => {
    try {
      const { chatId } = data;
      socket.leave(`chat_${chatId}`);
      
      // Notify other participants
      socket.to(`chat_${chatId}`).emit('user_left_chat', {
        userId: socket.userId,
        userName: socket.user.firstName
      });

      logger.socket('User left chat', { 
        userId: socket.userId, 
        chatId 
      });

    } catch (error) {
      logger.error('Leave chat error:', error);
    }
  });

  // Handle sending messages
  socket.on('send_message', async (data) => {
    try {
      const { chatId, content, messageType = 'text', attachment } = data;

      // Validate input
      if (!chatId || !content?.trim()) {
        socket.emit('error', { message: 'Chat ID and message content are required' });
        return;
      }

      // Find chat and verify access
      const chat = await Chat.findById(chatId);
      if (!chat || !chat.isParticipant(socket.userId)) {
        socket.emit('error', { message: 'Access denied to this chat' });
        return;
      }

      // Create message data
      const messageData = {
        sender: socket.userId,
        content: content.trim(),
        messageType,
        attachment: attachment || undefined
      };

      // Add message to chat
      await chat.addMessage(messageData);

      // Get the newly added message with sender info
      const populatedChat = await Chat.findById(chatId)
        .populate('messages.sender', 'firstName lastName profilePicture')
        .populate('listing', 'title images');

      const newMessage = populatedChat.messages[populatedChat.messages.length - 1];

      // Emit to all participants in the chat room
      io.to(`chat_${chatId}`).emit('new_message', {
        chatId,
        message: newMessage,
        chat: {
          id: chat._id,
          lastMessage: chat.lastMessage,
          updatedAt: chat.updatedAt
        }
      });

      // Send push notification to offline users
      const offlineParticipants = chat.participants
        .filter(p => !p.user.equals(socket.userId) && !activeConnections.has(p.user.toString()))
        .map(p => p.user);

      if (offlineParticipants.length > 0) {
        // TODO: Implement push notification service
        logger.info('Push notification needed for offline users', {
          chatId,
          offlineUsers: offlineParticipants.length
        });
      }

      logger.socket('Message sent', {
        userId: socket.userId,
        chatId,
        messageType
      });

    } catch (error) {
      logger.error('Send message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle message editing
  socket.on('edit_message', async (data) => {
    try {
      const { chatId, messageId, newContent } = data;

      if (!newContent?.trim()) {
        socket.emit('error', { message: 'Message content cannot be empty' });
        return;
      }

      const chat = await Chat.findById(chatId);
      if (!chat || !chat.isParticipant(socket.userId)) {
        socket.emit('error', { message: 'Access denied to this chat' });
        return;
      }

      const message = chat.messages.id(messageId);
      if (!message || !message.sender.equals(socket.userId)) {
        socket.emit('error', { message: 'Cannot edit this message' });
        return;
      }

      // Check if message is not too old (e.g., 15 minutes)
      const messageAge = Date.now() - message.createdAt.getTime();
      if (messageAge > 15 * 60 * 1000) {
        socket.emit('error', { message: 'Message is too old to edit' });
        return;
      }

      // Edit message
      message.edited.originalContent = message.content;
      message.content = newContent.trim();
      message.edited.isEdited = true;
      message.edited.editedAt = new Date();

      await chat.save();

      // Emit to all participants
      io.to(`chat_${chatId}`).emit('message_edited', {
        chatId,
        messageId,
        newContent: message.content,
        editedAt: message.edited.editedAt
      });

      logger.socket('Message edited', {
        userId: socket.userId,
        chatId,
        messageId
      });

    } catch (error) {
      logger.error('Edit message error:', error);
      socket.emit('error', { message: 'Failed to edit message' });
    }
  });

  // Handle message deletion
  socket.on('delete_message', async (data) => {
    try {
      const { chatId, messageId } = data;

      const chat = await Chat.findById(chatId);
      if (!chat || !chat.isParticipant(socket.userId)) {
        socket.emit('error', { message: 'Access denied to this chat' });
        return;
      }

      const message = chat.messages.id(messageId);
      if (!message || !message.sender.equals(socket.userId)) {
        socket.emit('error', { message: 'Cannot delete this message' });
        return;
      }

      // Soft delete message
      message.deleted.isDeleted = true;
      message.deleted.deletedAt = new Date();
      message.deleted.deletedBy = socket.userId;
      message.content = 'This message was deleted';

      await chat.save();

      // Emit to all participants
      io.to(`chat_${chatId}`).emit('message_deleted', {
        chatId,
        messageId,
        deletedAt: message.deleted.deletedAt
      });

      logger.socket('Message deleted', {
        userId: socket.userId,
        chatId,
        messageId
      });

    } catch (error) {
      logger.error('Delete message error:', error);
      socket.emit('error', { message: 'Failed to delete message' });
    }
  });

  // Handle typing indicators
  socket.on('typing_start', (data) => {
    const { chatId } = data;
    socket.to(`chat_${chatId}`).emit('user_typing', {
      userId: socket.userId,
      userName: socket.user.firstName,
      isTyping: true
    });
  });

  socket.on('typing_stop', (data) => {
    const { chatId } = data;
    socket.to(`chat_${chatId}`).emit('user_typing', {
      userId: socket.userId,
      userName: socket.user.firstName,
      isTyping: false
    });
  });

  // Handle chat creation (when user inquires about a listing)
  socket.on('create_inquiry', async (data) => {
    try {
      const { listingId, message } = data;

      if (!listingId || !message?.trim()) {
        socket.emit('error', { message: 'Listing ID and message are required' });
        return;
      }

      // Find listing
      const listing = await Listing.findById(listingId).populate('seller');
      if (!listing) {
        socket.emit('error', { message: 'Listing not found' });
        return;
      }

      // Check if user is not the seller
      if (listing.seller._id.equals(socket.userId)) {
        socket.emit('error', { message: 'Cannot inquire about your own listing' });
        return;
      }

      // Find or create chat
      const chat = await Chat.findOrCreate(
        socket.userId,
        listing.seller._id,
        listingId
      );

      // Add initial message if this is a new chat
      if (chat.messages.length === 0) {
        await chat.addMessage({
          sender: socket.userId,
          content: message.trim(),
          messageType: 'text'
        });

        // Update listing inquiry count
        listing.inquiries.total += 1;
        await listing.save();
      }

      // Join chat room
      socket.join(`chat_${chat._id}`);

      // Populate chat data
      const populatedChat = await Chat.findById(chat._id)
        .populate('participants.user', 'firstName lastName profilePicture')
        .populate('listing', 'title images price')
        .populate('messages.sender', 'firstName lastName profilePicture');

      // Emit to buyer
      socket.emit('inquiry_created', {
        chat: populatedChat,
        message: 'Inquiry sent successfully'
      });

      // Notify seller if online
      const sellerConnection = activeConnections.get(listing.seller._id.toString());
      if (sellerConnection) {
        io.to(`user_${listing.seller._id}`).emit('new_inquiry', {
          chat: populatedChat,
          listing: {
            id: listing._id,
            title: listing.title,
            images: listing.images
          },
          buyer: {
            id: socket.userId,
            name: socket.user.firstName + ' ' + socket.user.lastName
          }
        });
      }

      logger.socket('Inquiry created', {
        buyerId: socket.userId,
        sellerId: listing.seller._id,
        listingId,
        chatId: chat._id
      });

    } catch (error) {
      logger.error('Create inquiry error:', error);
      socket.emit('error', { message: 'Failed to create inquiry' });
    }
  });

  // Handle getting user's chats
  socket.on('get_chats', async (data) => {
    try {
      const { page = 1, limit = 20 } = data || {};
      
      const chats = await Chat.findForUser(socket.userId, { limit: parseInt(limit) })
        .skip((page - 1) * limit);

      socket.emit('chats_loaded', {
        chats,
        page: parseInt(page)
      });

    } catch (error) {
      logger.error('Get chats error:', error);
      socket.emit('error', { message: 'Failed to load chats' });
    }
  });

  // Handle getting chat messages
  socket.on('get_messages', async (data) => {
    try {
      const { chatId, page = 1, limit = 50 } = data;

      const chat = await Chat.findById(chatId)
        .populate('messages.sender', 'firstName lastName profilePicture')
        .populate('listing', 'title images price');

      if (!chat || !chat.isParticipant(socket.userId)) {
        socket.emit('error', { message: 'Access denied to this chat' });
        return;
      }

      // Get paginated messages
      const startIndex = Math.max(0, chat.messages.length - (page * limit));
      const endIndex = chat.messages.length - ((page - 1) * limit);
      const messages = chat.messages.slice(startIndex, endIndex);

      socket.emit('messages_loaded', {
        chatId,
        messages,
        hasMore: startIndex > 0,
        page: parseInt(page)
      });

      // Mark messages as read
      await chat.markAsRead(socket.userId);

    } catch (error) {
      logger.error('Get messages error:', error);
      socket.emit('error', { message: 'Failed to load messages' });
    }
  });

  // Handle user activity updates
  socket.on('activity', () => {
    const connection = activeConnections.get(socket.userId);
    if (connection) {
      connection.lastActivity = new Date();
    }
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    logger.socket('User disconnected', {
      userId: socket.userId,
      socketId: socket.id,
      reason
    });

    // Remove from active connections
    activeConnections.delete(socket.userId);

    // Leave all rooms
    socket.rooms.forEach(room => {
      if (room.startsWith('chat_')) {
        socket.to(room).emit('user_offline', {
          userId: socket.userId,
          userName: socket.user.firstName
        });
      }
    });
  });

  // Handle errors
  socket.on('error', (error) => {
    logger.error('Socket error:', {
      userId: socket.userId,
      socketId: socket.id,
      error: error.message
    });
  });
};

// Middleware to authenticate socket connections
const initializeSocket = (io) => {
  io.use(authenticateSocket);
  
  io.on('connection', (socket) => {
    socketHandler(io, socket);
  });

  // Clean up inactive connections periodically
  setInterval(() => {
    const now = new Date();
    const inactiveThreshold = 30 * 60 * 1000; // 30 minutes

    for (const [userId, connection] of activeConnections.entries()) {
      if (now - connection.lastActivity > inactiveThreshold) {
        logger.socket('Removing inactive connection', { userId });
        activeConnections.delete(userId);
      }
    }
  }, 5 * 60 * 1000); // Check every 5 minutes

  return io;
};

// Utility functions
const getActiveUsers = () => {
  return Array.from(activeConnections.keys());
};

const isUserOnline = (userId) => {
  return activeConnections.has(userId.toString());
};

const getConnectionCount = () => {
  return activeConnections.size;
};

const sendNotificationToUser = (userId, event, data) => {
  const connection = activeConnections.get(userId.toString());
  if (connection) {
    io.to(`user_${userId}`).emit(event, data);
    return true;
  }
  return false;
};

module.exports = {
  socketHandler,
  initializeSocket,
  getActiveUsers,
  isUserOnline,
  getConnectionCount,
  sendNotificationToUser
};



