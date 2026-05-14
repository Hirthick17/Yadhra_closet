// src/routes/upload.routes.js
// POST /api/upload — admin only (requires valid token + admin role)
// The multer middleware (upload.single) intercepts multipart/form-data,
// streams to Cloudinary, then passes file info to the controller.

const router = require('express').Router();
const { upload }          = require('../config/cloudinary');
const { uploadImage, deleteImage } = require('../controller/upload.controller');
const { protect, adminOnly } = require('../middleware/auth');

// Multer error handler — catches file size / format errors gracefully
const handleMulterError = (err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File too large. Max 5 MB.' });
  }
  if (err.message?.includes('format')) {
    return res.status(400).json({ success: false, message: 'Only JPG, PNG, WebP allowed.' });
  }
  next(err);
};

// Single image upload — field name must be "image"
router.post(
  '/',
  upload.single('image'),
  handleMulterError,
  uploadImage
);

// Delete image from Cloudinary
router.delete(
  '/',
  deleteImage
);

module.exports = router;
