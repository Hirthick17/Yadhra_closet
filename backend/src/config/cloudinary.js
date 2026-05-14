// src/config/cloudinary.js
// Initialises the Cloudinary SDK.
// multer / multer-storage-cloudinary are no longer needed —
// images are uploaded directly from the browser using a signed token.

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

module.exports = { cloudinary };
