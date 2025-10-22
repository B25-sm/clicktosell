const express = require('express');
const {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  searchListings,
  getNearbyListings,
  getFeaturedListings,
  getUserListings,
  addToFavorites,
  removeFromFavorites,
  getFavoriteListings,
  incrementViews,
  renewListing,
} = require('../controllers/listings');

const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getListings);
router.get('/search', optionalAuth, searchListings);
router.get('/nearby', optionalAuth, getNearbyListings);
router.get('/featured', optionalAuth, getFeaturedListings);
router.get('/:id', optionalAuth, getListing);
router.put('/:id/views', incrementViews);

// Protected routes
router.post('/', protect, createListing);
router.put('/:id', protect, updateListing);
router.delete('/:id', protect, deleteListing);
router.get('/user/:userId', protect, getUserListings);
router.post('/:id/favorite', protect, addToFavorites);
router.delete('/:id/favorite', protect, removeFromFavorites);
router.get('/user/favorites', protect, getFavoriteListings);
router.put('/:id/renew', protect, renewListing);

module.exports = router;


