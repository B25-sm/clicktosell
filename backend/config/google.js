const { Client } = require('@googlemaps/google-maps-services-js');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const logger = require('../utils/logger');

// Initialize Google Maps client
const googleMapsClient = new Client({});

// Configure Google OAuth Strategy
const configureGoogleOAuth = () => {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.API_URL}/api/v1/auth/google/callback`,
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Here you would typically:
      // 1. Check if user exists in your database
      // 2. Create user if they don't exist
      // 3. Return user object
      
      const user = {
        id: profile.id,
        email: profile.emails[0].value,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        avatar: profile.photos[0].value,
        provider: 'google',
        verified: true, // Google users are pre-verified
      };
      
      logger.info(`Google OAuth login successful for user: ${user.email}`);
      return done(null, user);
    } catch (error) {
      logger.error('Google OAuth error:', error);
      return done(error, null);
    }
  }));
};

// Get place details from Google Maps
const getPlaceDetails = async (placeId) => {
  try {
    const response = await googleMapsClient.placeDetails({
      params: {
        place_id: placeId,
        key: process.env.GOOGLE_MAPS_API_KEY,
        fields: ['name', 'formatted_address', 'geometry', 'types', 'rating', 'user_ratings_total'],
      },
    });

    logger.info(`Place details retrieved for: ${placeId}`);
    
    return {
      success: true,
      data: response.data.result,
      message: 'Place details retrieved successfully',
    };
  } catch (error) {
    logger.error('Error getting place details:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to get place details',
    };
  }
};

// Search places using Google Maps
const searchPlaces = async (query, location = null, radius = 5000) => {
  try {
    const params = {
      query: query,
      key: process.env.GOOGLE_MAPS_API_KEY,
      type: 'establishment',
    };

    if (location) {
      params.location = location;
      params.radius = radius;
    }

    const response = await googleMapsClient.textSearch({
      params: params,
    });

    logger.info(`Places search completed for: ${query}`);
    
    return {
      success: true,
      data: response.data.results,
      message: 'Places search completed successfully',
    };
  } catch (error) {
    logger.error('Error searching places:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to search places',
    };
  }
};

// Get geocoding information
const geocodeAddress = async (address) => {
  try {
    const response = await googleMapsClient.geocode({
      params: {
        address: address,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    logger.info(`Geocoding completed for: ${address}`);
    
    return {
      success: true,
      data: response.data.results,
      message: 'Geocoding completed successfully',
    };
  } catch (error) {
    logger.error('Error geocoding address:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to geocode address',
    };
  }
};

// Get reverse geocoding information
const reverseGeocode = async (lat, lng) => {
  try {
    const response = await googleMapsClient.reverseGeocode({
      params: {
        latlng: { lat: parseFloat(lat), lng: parseFloat(lng) },
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    logger.info(`Reverse geocoding completed for: ${lat}, ${lng}`);
    
    return {
      success: true,
      data: response.data.results,
      message: 'Reverse geocoding completed successfully',
    };
  } catch (error) {
    logger.error('Error reverse geocoding:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to reverse geocode coordinates',
    };
  }
};

// Calculate distance between two points
const calculateDistance = async (origin, destination) => {
  try {
    const response = await googleMapsClient.distancematrix({
      params: {
        origins: [origin],
        destinations: [destination],
        key: process.env.GOOGLE_MAPS_API_KEY,
        units: 'metric',
      },
    });

    const result = response.data.rows[0].elements[0];
    
    logger.info(`Distance calculated between ${origin} and ${destination}`);
    
    return {
      success: true,
      data: {
        distance: result.distance,
        duration: result.duration,
        status: result.status,
      },
      message: 'Distance calculated successfully',
    };
  } catch (error) {
    logger.error('Error calculating distance:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to calculate distance',
    };
  }
};

// Test Google services connection
const testGoogleServices = async () => {
  try {
    // Test Google Maps API
    const mapsTest = await geocodeAddress('New York, NY');
    
    logger.info('Google services connection test successful');
    return {
      success: true,
      message: 'Google services connection successful',
      services: {
        maps: mapsTest.success,
        oauth: !!process.env.GOOGLE_CLIENT_ID,
      },
    };
  } catch (error) {
    logger.error('Google services connection test failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Google services connection failed',
    };
  }
};

module.exports = {
  configureGoogleOAuth,
  googleMapsClient,
  getPlaceDetails,
  searchPlaces,
  geocodeAddress,
  reverseGeocode,
  calculateDistance,
  testGoogleServices,
};






