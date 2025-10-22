const express = require('express');
const {
  getChats,
  getChat,
  createChat,
  sendMessage,
  markAsRead,
  deleteChat,
} = require('../controllers/chat');

const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getChats);
router.post('/', createChat);
router.get('/:id', getChat);
router.post('/:id/messages', sendMessage);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteChat);

module.exports = router;


