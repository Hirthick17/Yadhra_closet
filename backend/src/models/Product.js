// src/models/Product.js
// Categories use the same slug values as the React frontend (store.ts)
// Frontend: "everyday" | "festive" | "floral" | "minimal"
// The categoryLabel (display name) is stored separately for UI rendering
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // Slug ID — matches frontend store.ts product IDs (e.g. "blossom-linen")
  // Used by frontend loader: /product/$id  → looks up by slug
  slug: {
    type:   String,
    unique: true,
    trim:   true,
    lowercase: true,
  },

  name:         { type: String, required: true, trim: true },
  subtitle:     { type: String, trim: true },       // e.g. "Summer Edition 2026"
  description:  { type: String, required: true },

  // Category slug — matches frontend Product type
  category: {
    type: String,
    required: true,
    enum: ['everyday', 'festive', 'floral', 'minimal'],
  },
  categoryLabel: { type: String }, // Display label, e.g. "Everyday Wear"

  price:         { type: Number, required: true, min: 0 },
  oldPrice:      { type: Number, min: 0 },           // MRP / strikethrough price

  // Arrays to match frontend Product type
  image:   { type: String },                          // Primary image URL
  images:  [{ type: String }],                        // Gallery array
  colors:  [{ type: String }],                        // Hex codes, e.g. ["#D9C2A7"]
  sizes:   [{ type: String, default: ['XS','S','M','L','XL','XXL'] }],
  outOfStockSizes: [{ type: String }],                // e.g. ['XS']

  rating:      { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0 },          // Matches 'ratingCount' in frontend
  badge:       { type: String, enum: ['new', 'sale', null], default: null },

  stock:    { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true },         // Soft delete
}, { timestamps: true });

// Text index for full-text search via ?search=<term>
productSchema.index({ name: 'text', description: 'text' });
// Fast category filter
productSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('Product', productSchema);
