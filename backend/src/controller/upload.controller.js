// src/controller/upload.controller.js
// WHY this approach:
//   The old pattern streamed the entire image through this Express server to Cloudinary.
//   Vercel serverless functions cap request bodies at 4.5 MB, making that pattern
//   incompatible with Vercel deployments.
//
//   NEW PATTERN — Cloudinary Signed Direct Upload:
//   1. Frontend asks this endpoint for a short-lived signature (< 1 KB response).
//   2. Frontend uploads the file directly to Cloudinary using that signature.
//   3. Cloudinary returns the secure URL and public_id directly to the browser.
//   4. Frontend saves those values to MongoDB via the products API.
//
//   The API secret NEVER leaves the server. The signature expires in 1 hour.

const cloudinary = require('cloudinary').v2;

// POST /api/upload/sign
// Returns: { signature, timestamp, cloudName, apiKey, folder }
// Called by the frontend before it uploads directly to Cloudinary.
exports.getSignature = (req, res) => {
  const timestamp = Math.round(Date.now() / 1000);
  const folder    = 'yadhra-closet/products';

  // Parameters that will be sent with the upload request.
  // They MUST match exactly what the browser sends to Cloudinary.
  const paramsToSign = {
    timestamp,
    folder,
    // Image transformations applied server-side by Cloudinary on upload:
    // limit width to 1200px, height to 1600px, auto-quality, auto-format.
    eager: 'c_limit,w_1200,h_1600,q_auto,f_auto',
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET
  );

  res.json({
    success:   true,
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey:    process.env.CLOUDINARY_API_KEY,
    folder,
  });
};

// DELETE /api/upload
// Deletes an image from Cloudinary by its public_id.
// Called by admin when removing an image from a product.
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
