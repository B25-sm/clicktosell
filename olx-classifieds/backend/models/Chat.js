const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'location', 'contact'],
    default: 'text',
  },
  metadata: {
    fileName: String,
    fileSize: Number,
    mimeType: String,
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
    contact: {
      name: String,
      phone: String,
    },
  },
  readBy: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    readAt: {
      type: Date,
      default: Date.now,
    },
  }],
  edited: {
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: Date,
    originalContent: String,
  },
}, {
  timestamps: true,
});

const ChatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  }],
  listing: {
    type: mongoose.Schema.ObjectId,
    ref: 'Listing',
    required: true,
  },
  messages: [MessageSchema],
  lastMessage: {
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    content: String,
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'location', 'contact'],
      default: 'text',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  blockedBy: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    blockedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  archivedBy: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    archivedAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better performance
ChatSchema.index({ participants: 1 });
ChatSchema.index({ listing: 1 });
ChatSchema.index({ 'lastMessage.createdAt': -1 });
ChatSchema.index({ createdAt: -1 });

// Virtual for unread message count per user
ChatSchema.virtual('unreadCount').get(function() {
  // This will be calculated dynamically based on the requesting user
  return 0; // Placeholder - actual calculation done in controller
});

// Virtual for other participant (for 1-on-1 chats)
ChatSchema.virtual('otherParticipant').get(function() {
  // This will be set dynamically based on the requesting user
  return null; // Placeholder
});

// Pre-save middleware to update lastMessage
ChatSchema.pre('save', function(next) {
  if (this.messages && this.messages.length > 0) {
    const lastMsg = this.messages[this.messages.length - 1];
    this.lastMessage = {
      sender: lastMsg.sender,
      content: lastMsg.content,
      type: lastMsg.type,
      createdAt: lastMsg.createdAt || new Date(),
    };
  }
  next();
});

// Static method to find or create chat
ChatSchema.statics.findOrCreateChat = async function(userId1, userId2, listingId) {
  let chat = await this.findOne({
    listing: listingId,
    participants: { $all: [userId1, userId2] },
  });

  if (!chat) {
    chat = await this.create({
      participants: [userId1, userId2],
      listing: listingId,
      messages: [],
    });
  }

  return chat;
};

// Method to add message
ChatSchema.methods.addMessage = function(senderId, content, type = 'text', metadata = {}) {
  const message = {
    sender: senderId,
    content,
    type,
    metadata,
    createdAt: new Date(),
  };

  this.messages.push(message);
  
  this.lastMessage = {
    sender: senderId,
    content,
    type,
    createdAt: new Date(),
  };

  return this.save();
};

// Method to mark messages as read
ChatSchema.methods.markAsRead = function(userId) {
  let updatedCount = 0;
  
  this.messages.forEach((message) => {
    if (
      message.sender.toString() !== userId.toString() &&
      !message.readBy.some(read => read.user.toString() === userId.toString())
    ) {
      message.readBy.push({ user: userId, readAt: new Date() });
      updatedCount++;
    }
  });

  if (updatedCount > 0) {
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Method to get unread count for a user
ChatSchema.methods.getUnreadCount = function(userId) {
  return this.messages.filter(
    (message) =>
      message.sender.toString() !== userId.toString() &&
      !message.readBy.some(read => read.user.toString() === userId.toString())
  ).length;
};

// Method to check if user is blocked
ChatSchema.methods.isUserBlocked = function(userId) {
  return this.blockedBy.some(block => block.user.toString() === userId.toString());
};

// Method to block user
ChatSchema.methods.blockUser = function(userId) {
  if (!this.isUserBlocked(userId)) {
    this.blockedBy.push({ user: userId, blockedAt: new Date() });
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to unblock user
ChatSchema.methods.unblockUser = function(userId) {
  this.blockedBy = this.blockedBy.filter(
    block => block.user.toString() !== userId.toString()
  );
  return this.save();
};

// Method to archive chat for user
ChatSchema.methods.archiveForUser = function(userId) {
  const existingArchive = this.archivedBy.find(
    archive => archive.user.toString() === userId.toString()
  );
  
  if (!existingArchive) {
    this.archivedBy.push({ user: userId, archivedAt: new Date() });
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Method to unarchive chat for user
ChatSchema.methods.unarchiveForUser = function(userId) {
  this.archivedBy = this.archivedBy.filter(
    archive => archive.user.toString() !== userId.toString()
  );
  return this.save();
};

// Method to check if chat is archived for user
ChatSchema.methods.isArchivedForUser = function(userId) {
  return this.archivedBy.some(archive => archive.user.toString() === userId.toString());
};

// Method to delete message
ChatSchema.methods.deleteMessage = function(messageId, userId) {
  const message = this.messages.id(messageId);
  
  if (!message) {
    throw new Error('Message not found');
  }
  
  // Only sender can delete message
  if (message.sender.toString() !== userId.toString()) {
    throw new Error('Not authorized to delete this message');
  }
  
  message.remove();
  
  // Update lastMessage if this was the last message
  if (this.messages.length > 0) {
    const lastMsg = this.messages[this.messages.length - 1];
    this.lastMessage = {
      sender: lastMsg.sender,
      content: lastMsg.content,
      type: lastMsg.type,
      createdAt: lastMsg.createdAt,
    };
  } else {
    this.lastMessage = undefined;
  }
  
  return this.save();
};

// Method to edit message
ChatSchema.methods.editMessage = function(messageId, userId, newContent) {
  const message = this.messages.id(messageId);
  
  if (!message) {
    throw new Error('Message not found');
  }
  
  // Only sender can edit message
  if (message.sender.toString() !== userId.toString()) {
    throw new Error('Not authorized to edit this message');
  }
  
  // Store original content if not already edited
  if (!message.edited.isEdited) {
    message.edited.originalContent = message.content;
  }
  
  message.content = newContent;
  message.edited.isEdited = true;
  message.edited.editedAt = new Date();
  
  // Update lastMessage if this was the last message
  if (this.messages[this.messages.length - 1]._id.toString() === messageId.toString()) {
    this.lastMessage.content = newContent;
  }
  
  return this.save();
};

module.exports = mongoose.model('Chat', ChatSchema);


