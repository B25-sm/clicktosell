const Chat = require('../models/Chat');
const User = require('../models/User');
const Listing = require('../models/Listing');
const { logger } = require('../utils/logger');

// @desc    Get all chats for user
// @route   GET /api/chat
// @access  Private
const getChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
    })
      .populate('participants', 'fullName avatar lastLogin')
      .populate('listing', 'title price primaryImage status')
      .populate('lastMessage.sender', 'fullName')
      .sort('-lastMessage.createdAt');

    res.status(200).json({
      status: 'success',
      count: chats.length,
      data: {
        chats,
      },
    });
  } catch (error) {
    logger.error('Get chats error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Get single chat
// @route   GET /api/chat/:id
// @access  Private
const getChat = async (req, res, next) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      participants: req.user._id,
    })
      .populate('participants', 'fullName avatar lastLogin')
      .populate('listing', 'title price images seller status')
      .populate('messages.sender', 'fullName avatar');

    if (!chat) {
      return res.status(404).json({
        status: 'error',
        message: 'Chat not found',
      });
    }

    // Mark messages as read for current user
    const unreadMessages = chat.messages.filter(
      (message) =>
        message.sender.toString() !== req.user._id.toString() &&
        !message.readBy.includes(req.user._id)
    );

    if (unreadMessages.length > 0) {
      unreadMessages.forEach((message) => {
        message.readBy.push(req.user._id);
      });
      await chat.save();
    }

    res.status(200).json({
      status: 'success',
      data: {
        chat,
      },
    });
  } catch (error) {
    logger.error('Get chat error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Create new chat
// @route   POST /api/chat
// @access  Private
const createChat = async (req, res, next) => {
  try {
    const { listingId, message } = req.body;

    // Get listing and check if it exists
    const listing = await Listing.findById(listingId).populate('seller');

    if (!listing) {
      return res.status(404).json({
        status: 'error',
        message: 'Listing not found',
      });
    }

    // Check if user is trying to chat with themselves
    if (listing.seller._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot chat with yourself',
      });
    }

    // Check if chat already exists between these users for this listing
    let chat = await Chat.findOne({
      listing: listingId,
      participants: { $all: [req.user._id, listing.seller._id] },
    });

    if (chat) {
      // Chat exists, add new message if provided
      if (message) {
        chat.messages.push({
          sender: req.user._id,
          content: message,
          type: 'text',
        });

        chat.lastMessage = {
          sender: req.user._id,
          content: message,
          type: 'text',
          createdAt: new Date(),
        };

        await chat.save();
      }
    } else {
      // Create new chat
      const chatData = {
        participants: [req.user._id, listing.seller._id],
        listing: listingId,
        messages: [],
      };

      if (message) {
        chatData.messages.push({
          sender: req.user._id,
          content: message,
          type: 'text',
        });

        chatData.lastMessage = {
          sender: req.user._id,
          content: message,
          type: 'text',
          createdAt: new Date(),
        };
      }

      chat = await Chat.create(chatData);
    }

    // Populate the response
    await chat.populate([
      { path: 'participants', select: 'fullName avatar' },
      { path: 'listing', select: 'title price images' },
      { path: 'messages.sender', select: 'fullName avatar' },
    ]);

    res.status(201).json({
      status: 'success',
      data: {
        chat,
      },
    });

    logger.info(`Chat created/updated for listing: ${listingId}`);
  } catch (error) {
    logger.error('Create chat error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Send message
// @route   POST /api/chat/:id/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { content, type = 'text' } = req.body;

    const chat = await Chat.findOne({
      _id: req.params.id,
      participants: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({
        status: 'error',
        message: 'Chat not found',
      });
    }

    // Create new message
    const newMessage = {
      sender: req.user._id,
      content,
      type,
      createdAt: new Date(),
    };

    chat.messages.push(newMessage);
    chat.lastMessage = {
      sender: req.user._id,
      content,
      type,
      createdAt: new Date(),
    };

    await chat.save();

    // Populate the new message
    await chat.populate('messages.sender', 'fullName avatar');

    // Get the last message (the one we just added)
    const lastMessage = chat.messages[chat.messages.length - 1];

    res.status(201).json({
      status: 'success',
      data: {
        message: lastMessage,
      },
    });

    // TODO: Emit socket event for real-time messaging
    // io.to(chat._id.toString()).emit('new_message', lastMessage);

    logger.info(`Message sent in chat: ${chat._id}`);
  } catch (error) {
    logger.error('Send message error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/chat/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      participants: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({
        status: 'error',
        message: 'Chat not found',
      });
    }

    // Mark all unread messages as read
    let updatedCount = 0;
    chat.messages.forEach((message) => {
      if (
        message.sender.toString() !== req.user._id.toString() &&
        !message.readBy.includes(req.user._id)
      ) {
        message.readBy.push(req.user._id);
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      await chat.save();
    }

    res.status(200).json({
      status: 'success',
      message: `${updatedCount} messages marked as read`,
    });
  } catch (error) {
    logger.error('Mark as read error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Delete chat
// @route   DELETE /api/chat/:id
// @access  Private
const deleteChat = async (req, res, next) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      participants: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({
        status: 'error',
        message: 'Chat not found',
      });
    }

    await chat.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Chat deleted successfully',
    });

    logger.info(`Chat deleted: ${chat._id} by ${req.user.email}`);
  } catch (error) {
    logger.error('Delete chat error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Get unread message count
// @route   GET /api/chat/unread-count
// @access  Private
const getUnreadCount = async (req, res, next) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
    });

    let totalUnread = 0;

    chats.forEach((chat) => {
      const unreadCount = chat.messages.filter(
        (message) =>
          message.sender.toString() !== req.user._id.toString() &&
          !message.readBy.includes(req.user._id)
      ).length;
      totalUnread += unreadCount;
    });

    res.status(200).json({
      status: 'success',
      data: {
        unreadCount: totalUnread,
      },
    });
  } catch (error) {
    logger.error('Get unread count error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Search chats
// @route   GET /api/chat/search
// @access  Private
const searchChats = async (req, res, next) => {
  try {
    const { q: searchTerm } = req.query;

    if (!searchTerm) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a search term',
      });
    }

    const chats = await Chat.find({
      participants: req.user._id,
      $or: [
        { 'messages.content': { $regex: searchTerm, $options: 'i' } },
        { 'listing.title': { $regex: searchTerm, $options: 'i' } },
      ],
    })
      .populate('participants', 'fullName avatar')
      .populate('listing', 'title price images')
      .sort('-lastMessage.createdAt');

    res.status(200).json({
      status: 'success',
      count: chats.length,
      data: {
        chats,
      },
    });
  } catch (error) {
    logger.error('Search chats error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

module.exports = {
  getChats,
  getChat,
  createChat,
  sendMessage,
  markAsRead,
  deleteChat,
  getUnreadCount,
  searchChats,
};


