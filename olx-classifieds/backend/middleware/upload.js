const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');

const useS3 = String(process.env.USE_S3 || '').toLowerCase() === 'true';

let upload;

if (useS3) {
  const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const bucket = process.env.AWS_S3_BUCKET;
  const folder = process.env.S3_FOLDER || 'uploads';

  upload = multer({
    storage: multerS3({
      s3,
      bucket,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      acl: 'public-read',
      key: function (req, file, cb) {
        const ext = file.originalname.split('.').pop();
        const name = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const key = `${folder}/${name}`;
        cb(null, key);
      },
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
    }),
    limits: { fileSize: Number(process.env.MAX_FILE_SIZE || 10 * 1024 * 1024) },
  });
} else {
  // Fallback to disk storage (dev only)
  const path = require('path');
  const fs = require('fs');
  const uploadDir = process.env.UPLOAD_PATH || path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const ext = file.originalname.split('.').pop();
      const name = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      cb(null, name);
    },
  });

  upload = multer({ storage, limits: { fileSize: Number(process.env.MAX_FILE_SIZE || 10 * 1024 * 1024) } });
}

module.exports = { upload };






