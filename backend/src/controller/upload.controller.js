// src/controller/upload.controller.js
// POST /api/upload — admin only.
// Receives a multipart form file, streams to Cloudinary, returns the URL.
// WHY here and not in product controller: separates concerns — upload is reusable.

const { cloudinary } = require('../config/cloudinary');

// Single image upload
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // req.file.path is the Cloudinary URL (set by multer-storage-cloudinary)
    // req.file.filename is the Cloudinary public_id
    res.json({
      success:  true,
      url:      req.file.path,       // Full HTTPS Cloudinary URL
      publicId: req.file.filename,   // For future deletion
    });
  } catch (err) { next(err); }
};

// Delete image from Cloudinary (called when admin removes an image from a product)
exports.deleteImage = async (req, res, next) => {
  try {
    const { publicId } = req.body;
    if (!publicId) {
      return res.status(400).json({ success: false, message: 'publicId required' });
    }
    await cloudinary.uploader.destroy(publicId);
    res.json({ success: true, message: 'Image deleted' });
  } catch (err) { next(err); }
};
