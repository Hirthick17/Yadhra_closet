// src/routes/upload.routes.js
// POST /api/upload/sign  — admin-only: returns a Cloudinary signed-upload token.
// DELETE /api/upload     — admin-only: deletes an image by publicId.
//
// WHY no multer here any more:
//   Multer was needed when files were proxied through this server.
//   Now the browser uploads directly to Cloudinary using the signed token,
//   so this server only handles tiny JSON requests — no multipart/form-data.

const router = require('express').Router();
const { getSignature, deleteImage } = require('../controller/upload.controller');
const { protect, adminOnly }        = require('../middleware/auth');

// Generate a signed upload token for the frontend.
// Only admins can get a signature — prevents anonymous Cloudinary uploads.
router.post('/sign', protect, adminOnly, getSignature);

// Delete an image from Cloudinary.
router.delete('/', protect, adminOnly, deleteImage);

module.exports = router;
