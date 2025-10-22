const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'document', 'location', 'system'],
    default: 'text'
  },
  attachment: {
    url: String,
    publicId: String,
    filename: String,
    fileSize: Number,
    mimeType: String
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  edited: {
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    originalContent: String
  },
  deleted: {
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date,
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true
});

const chatSchema = new mongoose.Schema({
  // Chat Participants
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    leftAt: Date,
    role: {
      type: String,
      enum: ['buyer', 'seller', 'moderator'],
      default: 'buyer'
    }
  }],
  
  // Related Listing
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  
  // Chat Type
  chatType: {
    type: String,
    enum: ['inquiry', 'negotiation', 'support'],
    default: 'inquiry'
  },
  
  // Chat Status
  status: {
    type: String,
    enum: ['active', 'archived', 'blocked', 'closed'],
    default: 'active'
  },
  
  // Messages
  messages: [messageSchema],
  
  // Last Message Info (for quick access)
  lastMessage: {
    content: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sentAt: Date,
    messageType: {
      type: String,
      default: 'text'
    }
  },
  
  // Unread Count per User
  unreadCount: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    count: {
      type: Number,
      default: 0
    }
  }],
  
  // Chat Settings
  settings: {
    allowImages: {
      type: Boolean,
      default: true
    },
    allowDocuments: {
      type: Boolean,
      default: true
    },
    autoArchiveAfterDays: {
      type: Number,
      default: 30
    }
  },
  
  // Moderation
  moderation: {
    isReported: {
      type: Boolean,
      default: false
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reportReason: {
      type: String,
      enum: ['spam', 'harassment', 'inappropriate', 'fraud', 'other']
    },
    reportedAt: Date,
    moderatorNotes: String
  },
  
  // Quick Responses/Templates
  quickResponses: [{
    text: String,
    usedCount: {
      type: Number,
      default: 0
    }
  }],
  
  // Transaction Related
  transaction: {
    hasTransaction: {
      type: Boolean,
      default: false
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
    },
    agreedPrice: Number,
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'disputed']
    }
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
chatSchema.index({ participants: 1 });
chatSchema.index({ listing: 1 });
chatSchema.index({ status: 1 });
chatSchema.index({ updatedAt: -1 });
chatSchema.index({ 'participants.user': 1, status: 1 });

// Virtual for buyer
chatSchema.virtual('buyer').get(function() {
  const buyer = this.participants.find(p => p.role === 'buyer');
  return buyer ? buyer.user : null;
});

// Virtual for seller
chatSchema.virtual('seller').get(function() {
  const seller = this.participants.find(p => p.role === 'seller');
  return seller ? seller.user : null;
});

// Virtual for total messages
chatSchema.virtual('totalMessages').get(function() {
  return this.messages.length;
});

// Pre-save middleware to update last message
chatSchema.pre('save', function(next) {
  if (this.messages && this.messages.length > 0) {
    const lastMsg = this.messages[this.messages.length - 1];
    this.lastMessage = {
      content: lastMsg.content,
      sender: lastMsg.sender,
      sentAt: lastMsg.createdAt,
      messageType: lastMsg.messageType
    };
  }
  next();
});

// Method to add message
chatSchema.methods.addMessage = function(messageData) {
  this.messages.push(messageData);
  
  // Update unread count for other participants
  this.participants.forEach(participant => {
    if (!participant.user.equals(messageData.sender)) {
      let unreadEntry = this.unreadCount.find(u => u.user.equals(participant.user));
      if (unreadEntry) {
        unreadEntry.count += 1;
      } else {
        this.unreadCount.push({
          user: participant.user,
          count: 1
        });
      }
    }
  });
  
  return this.save();
};

// Method to mark messages as read
chatSchema.methods.markAsRead = function(userId) {
  // Mark unread count as 0 for this user
  const unreadEntry = this.unreadCount.find(u => u.user.equals(userId));
  if (unreadEntry) {
    unreadEntry.count = 0;
  }
  
  // Mark recent messages as read by this user
  this.messages.forEach(message => {
    if (!message.sender.equals(userId)) {
      const alreadyRead = message.readBy.some(r => r.user.equals(userId));
      if (!alreadyRead) {
        message.readBy.push({
          user: userId,
          readAt: new Date()
        });
      }
    }
  });
  
  return this.save();
};

// Method to archive chat
chatSchema.methods.archive = function() {
  this.status = 'archived';
  return this.save();
};

// Method to block chat
chatSchema.methods.block = function(blockedBy) {
  this.status = 'blocked';
  this.moderation.isReported = true;
  this.moderation.reportedBy = blockedBy;
  this.moderation.reportedAt = new Date();
  return this.save();
};

// Method to get unread count for user
chatSchema.methods.getUnreadCount = function(userId) {
  const unreadEntry = this.unreadCount.find(u => u.user.equals(userId));
  return unreadEntry ? unreadEntry.count : 0;
};

// Method to check if user is participant
chatSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.user.equals(userId));
};

// Static method to find chats for user
chatSchema.statics.findForUser = function(userId, options = {}) {
  const query = {
    'participants.user': userId,
    status: options.status || { $ne: 'closed' }
  };
  
  return this.find(query)
    .populate('participants.user', 'firstName lastName profilePicture')
    .populate('listing', 'title images price')
    .sort({ updatedAt: -1 })
    .limit(options.limit || 50);
};

// Static method to find or create chat
chatSchema.statics.findOrCreate = function(buyerId, sellerId, listingId) {
  return this.findOne({
    listing: listingId,
    'participants.user': { $all: [buyerId, sellerId] }
  }).then(existingChat => {
    if (existingChat) {
      return existingChat;
    }
    
    // Create new chat
    return this.create({
      participants: [
        { user: buyerId, role: 'buyer' },
        { user: sellerId, role: 'seller' }
      ],
      listing: listingId,
      unreadCount: [
        { user: buyerId, count: 0 },
        { user: sellerId, count: 0 }
      ]
    });
  });
};

module.exports = mongoose.model('Chat', chatSchema);



