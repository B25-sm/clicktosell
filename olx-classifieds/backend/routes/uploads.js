const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/upload');

// Single image upload
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    // For S3, location contains public URL; for disk, construct a local URL
    const file = req.file;
    const cdnBase = process.env.AWS_S3_CDN_URL || '';
    let url = file.location || file.path;

    if (!file.location && file.path) {
      url = `/uploads/${file.filename}`;
    }

    if (cdnBase && file.key) {
      url = `${cdnBase.replace(/\/$/, '')}/${file.key}`;
    }

    return res.status(201).json({
      success: true,
      key: file.key || file.filename,
      url,
      size: file.size,
      mimetype: file.mimetype,
    });
  } catch (err) {
    console.error('Upload error', err);
    return res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

module.exports = router;






