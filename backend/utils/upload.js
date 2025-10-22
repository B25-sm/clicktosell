const AWS = require('aws-sdk');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const logger = require('./logger');

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();
const bucketName = process.env.AWS_S3_BUCKET;

// Image processing options
const imageProcessingOptions = {
  thumbnail: { width: 300, height: 300, quality: 80 },
  medium: { width: 800, height: 600, quality: 85 },
  large: { width: 1200, height: 900, quality: 90 }
};

// Upload file to S3
const uploadToS3 = async ({ file, folder = 'uploads', userId, generateThumbnails = true }) => {
  try {
    if (!bucketName) {
      throw new Error('AWS S3 bucket not configured');
    }

    const fileExtension = file.originalname.split('.').pop().toLowerCase();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const key = `${folder}/${userId || 'anonymous'}/${fileName}`;

    let processedFile = file.buffer;
    let contentType = file.mimetype;

    // Process image if it's an image file
    if (file.mimetype.startsWith('image/')) {
      // Optimize main image
      processedFile = await sharp(file.buffer)
        .resize(1200, 900, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .jpeg({ quality: 90 })
        .toBuffer();
      
      contentType = 'image/jpeg';
    }

    // Upload main file
    const uploadParams = {
      Bucket: bucketName,
      Key: key,
      Body: processedFile,
      ContentType: contentType,
      ACL: 'public-read',
      Metadata: {
        originalName: file.originalname,
        uploadedBy: userId || 'anonymous',
        uploadedAt: new Date().toISOString()
      }
    };

    const result = await s3.upload(uploadParams).promise();

    const response = {
      url: result.Location,
      key: result.Key,
      bucket: bucketName,
      size: processedFile.length,
      originalName: file.originalname,
      contentType
    };

    // Generate thumbnails if requested and it's an image
    if (generateThumbnails && file.mimetype.startsWith('image/')) {
      const thumbnails = await generateImageThumbnails(file.buffer, folder, userId, fileName);
      response.thumbnails = thumbnails;
    }

    logger.info('File uploaded successfully', {
      key: result.Key,
      size: processedFile.length,
      userId
    });

    return response;

  } catch (error) {
    logger.error('File upload failed:', error);
    throw new Error('Failed to upload file: ' + error.message);
  }
};

// Generate image thumbnails
const generateImageThumbnails = async (imageBuffer, folder, userId, fileName) => {
  const thumbnails = {};
  const baseFileName = fileName.split('.')[0];

  for (const [size, options] of Object.entries(imageProcessingOptions)) {
    try {
      const processedImage = await sharp(imageBuffer)
        .resize(options.width, options.height, { 
          fit: 'cover', 
          position: 'center' 
        })
        .jpeg({ quality: options.quality })
        .toBuffer();

      const thumbnailKey = `${folder}/${userId || 'anonymous'}/thumbnails/${baseFileName}_${size}.jpg`;

      const uploadParams = {
        Bucket: bucketName,
        Key: thumbnailKey,
        Body: processedImage,
        ContentType: 'image/jpeg',
        ACL: 'public-read'
      };

      const result = await s3.upload(uploadParams).promise();
      
      thumbnails[size] = {
        url: result.Location,
        key: result.Key,
        width: options.width,
        height: options.height
      };

    } catch (error) {
      logger.warn(`Failed to generate ${size} thumbnail:`, error);
    }
  }

  return thumbnails;
};

// Upload multiple files
const uploadMultipleFiles = async ({ files, folder = 'uploads', userId, generateThumbnails = true }) => {
  const uploadPromises = files.map(file => 
    uploadToS3({ file, folder, userId, generateThumbnails })
  );

  try {
    const results = await Promise.allSettled(uploadPromises);
    
    const successful = results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);
    
    const failed = results
      .filter(result => result.status === 'rejected')
      .map(result => result.reason.message);

    return {
      successful,
      failed,
      totalUploaded: successful.length,
      totalFailed: failed.length
    };

  } catch (error) {
    logger.error('Multiple file upload failed:', error);
    throw new Error('Failed to upload files: ' + error.message);
  }
};

// Delete file from S3
const deleteFromS3 = async (key) => {
  try {
    if (!bucketName) {
      throw new Error('AWS S3 bucket not configured');
    }

    const deleteParams = {
      Bucket: bucketName,
      Key: key
    };

    await s3.deleteObject(deleteParams).promise();

    // Also delete thumbnails if they exist
    const baseKey = key.replace(/\.[^/.]+$/, ''); // Remove extension
    const thumbnailKeys = Object.keys(imageProcessingOptions).map(size => 
      `${baseKey.replace('/uploads/', '/uploads/thumbnails/')}_${size}.jpg`
    );

    const deletePromises = thumbnailKeys.map(thumbnailKey => 
      s3.deleteObject({ Bucket: bucketName, Key: thumbnailKey }).promise()
        .catch(error => {
          // Ignore errors for thumbnail deletion (they might not exist)
          logger.debug('Thumbnail deletion failed (might not exist):', { key: thumbnailKey });
        })
    );

    await Promise.all(deletePromises);

    logger.info('File deleted successfully', { key });

  } catch (error) {
    logger.error('File deletion failed:', error);
    throw new Error('Failed to delete file: ' + error.message);
  }
};

// Delete multiple files
const deleteMultipleFiles = async (keys) => {
  if (!keys || keys.length === 0) {
    return { deleted: 0, failed: 0 };
  }

  const deletePromises = keys.map(key => 
    deleteFromS3(key).catch(error => ({ error: error.message, key }))
  );

  try {
    const results = await Promise.all(deletePromises);
    
    const failed = results.filter(result => result.error);
    const deleted = results.length - failed.length;

    if (failed.length > 0) {
      logger.warn('Some files failed to delete:', failed);
    }

    return { deleted, failed: failed.length };

  } catch (error) {
    logger.error('Multiple file deletion failed:', error);
    throw new Error('Failed to delete files: ' + error.message);
  }
};

// Get signed URL for private files
const getSignedUrl = async (key, expiresIn = 3600) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: key,
      Expires: expiresIn // URL expires in seconds
    };

    const signedUrl = await s3.getSignedUrlPromise('getObject', params);
    return signedUrl;

  } catch (error) {
    logger.error('Failed to generate signed URL:', error);
    throw new Error('Failed to generate signed URL: ' + error.message);
  }
};

// Get file metadata
const getFileMetadata = async (key) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: key
    };

    const result = await s3.headObject(params).promise();
    
    return {
      size: result.ContentLength,
      lastModified: result.LastModified,
      contentType: result.ContentType,
      metadata: result.Metadata
    };

  } catch (error) {
    if (error.code === 'NotFound') {
      throw new Error('File not found');
    }
    logger.error('Failed to get file metadata:', error);
    throw new Error('Failed to get file metadata: ' + error.message);
  }
};

// Validate file type
const validateFileType = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/webp']) => {
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error(`File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }
  return true;
};

// Validate file size
const validateFileSize = (file, maxSizeInMB = 5) => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    throw new Error(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of ${maxSizeInMB}MB`);
  }
  return true;
};

// Generate unique filename
const generateUniqueFilename = (originalName, userId) => {
  const extension = originalName.split('.').pop().toLowerCase();
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${userId}_${timestamp}_${random}.${extension}`;
};

// Check if S3 is configured
const isS3Configured = () => {
  return !!(process.env.AWS_ACCESS_KEY_ID && 
           process.env.AWS_SECRET_ACCESS_KEY && 
           process.env.AWS_S3_BUCKET);
};

// Test S3 connection
const testS3Connection = async () => {
  try {
    if (!isS3Configured()) {
      throw new Error('S3 not configured');
    }

    await s3.listObjectsV2({
      Bucket: bucketName,
      MaxKeys: 1
    }).promise();

    logger.info('S3 connection test successful');
    return true;

  } catch (error) {
    logger.error('S3 connection test failed:', error);
    return false;
  }
};

// Clean up old files (utility for maintenance)
const cleanupOldFiles = async (folderPrefix, daysOld = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const listParams = {
      Bucket: bucketName,
      Prefix: folderPrefix
    };

    const objects = await s3.listObjectsV2(listParams).promise();
    
    const oldObjects = objects.Contents.filter(obj => 
      obj.LastModified < cutoffDate
    );

    if (oldObjects.length === 0) {
      return { deleted: 0, message: 'No old files found' };
    }

    const deleteParams = {
      Bucket: bucketName,
      Delete: {
        Objects: oldObjects.map(obj => ({ Key: obj.Key }))
      }
    };

    const result = await s3.deleteObjects(deleteParams).promise();
    
    logger.info('Old files cleaned up', {
      deleted: result.Deleted.length,
      errors: result.Errors.length
    });

    return {
      deleted: result.Deleted.length,
      errors: result.Errors.length,
      message: `Cleaned up ${result.Deleted.length} old files`
    };

  } catch (error) {
    logger.error('File cleanup failed:', error);
    throw new Error('Failed to cleanup old files: ' + error.message);
  }
};

module.exports = {
  uploadToS3,
  uploadMultipleFiles,
  deleteFromS3,
  deleteMultipleFiles,
  getSignedUrl,
  getFileMetadata,
  validateFileType,
  validateFileSize,
  generateUniqueFilename,
  isS3Configured,
  testS3Connection,
  cleanupOldFiles,
  imageProcessingOptions
};



