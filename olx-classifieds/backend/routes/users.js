const express = require('express');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  uploadAvatar,
  getUserProfile,
  updateUserProfile,
} = require('../controllers/users');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/avatar', protect, uploadAvatar);

// Admin only routes
router.use(protect);
router.use(authorize('admin'));

router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;


