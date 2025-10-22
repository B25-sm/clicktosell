const AWS = require('aws-sdk');
const multer = require('multer');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

const s3 = new AWS.S3();

// Multer configuration for memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// Upload single image to S3
const uploadImage = async (file, folder = 'listings') => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Generate unique filename
    const filename = `${folder}/${uuidv4()}-${Date.now()}.jpg`;
    
    // Process image with Sharp
    const processedImage = await sharp(file.buffer)
      .resize(800, 600, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Upload to S3
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: filename,
      Body: processedImage,
      ContentType: 'image/jpeg',
      ACL: 'public-read',
    };

    const result = await s3.upload(uploadParams).promise();
    
    logger.info(`Image uploaded to S3: ${result.Location}`);
    
    return {
      success: true,
      url: result.Location,
      key: filename,
      size: processedImage.length,
    };
  } catch (error) {
    logger.error('Error uploading image to S3:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Upload multiple images
const uploadMultipleImages = async (files, folder = 'listings') => {
  try {
    if (!files || files.length === 0) {
      return {
        success: true,
        urls: [],
        keys: [],
      };
    }

    const uploadPromises = files.map(file => uploadImage(file, folder));
    const results = await Promise.all(uploadPromises);
    
    const successful = results.filter(result => result.success);
    const failed = results.filter(result => !result.success);
    
    if (failed.length > 0) {
      logger.warn(`${failed.length} images failed to upload`);
    }
    
    return {
      success: successful.length > 0,
      urls: successful.map(result => result.url),
      keys: successful.map(result => result.key),
      failed: failed.length,
      total: files.length,
    };
  } catch (error) {
    logger.error('Error uploading multiple images:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Delete image from S3
const deleteImage = async (key) => {
  try {
    const deleteParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    };

    await s3.deleteObject(deleteParams).promise();
    
    logger.info(`Image deleted from S3: ${key}`);
    
    return {
      success: true,
      message: 'Image deleted successfully',
    };
  } catch (error) {
    logger.error('Error deleting image from S3:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Generate signed URL for temporary access
const generateSignedUrl = async (key, expiresIn = 3600) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Expires: expiresIn,
    };

    const url = s3.getSignedUrl('getObject', params);
    
    return {
      success: true,
      url: url,
      expiresIn: expiresIn,
    };
  } catch (error) {
    logger.error('Error generating signed URL:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Test S3 connection
const testS3Connection = async () => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      MaxKeys: 1,
    };

    await s3.listObjectsV2(params).promise();
    
    logger.info('S3 connection test successful');
    return {
      success: true,
      message: 'S3 connection successful',
    };
  } catch (error) {
    logger.error('S3 connection test failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'S3 connection failed',
    };
  }
};

module.exports = {
  s3,
  upload,
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  generateSignedUrl,
  testS3Connection,
};






