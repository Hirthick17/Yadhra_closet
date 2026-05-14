// src/config/cloudinary.js
// Cloudinary — stores kurti product images in the cloud.
// Free tier: 25GB storage, 25GB bandwidth/month.
// Sign up at https://cloudinary.com → get CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET

const cloudinary  = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

// Multer storage — files go directly to Cloudinary, no local disk writes
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:         'yadhra-closet/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1200, height: 1600, crop: 'limit', quality: 'auto', fetch_format: 'auto' }
    ],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB cap per image
});

module.exports = { cloudinary, upload };
