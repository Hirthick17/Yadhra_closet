// src/models/Order.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:      { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:         { type: String, required: true }, // Snapshot — product name at time of order
  price:        { type: Number, required: true }, // Snapshot — price at time of order
  quantity:     { type: Number, required: true, min: 1 },
  size:         { type: String },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  // T-01: user is optional — guest (unauthenticated) orders are allowed.
  // WhatsApp conversation is the order management layer for this boutique.
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, default: null },
  items:        [orderItemSchema],
  total:        { type: Number, required: true },
  status:       { type: String, enum: ['pending','confirmed','shipped','delivered','cancelled'],
                  default: 'pending' },
  address:      {
    firstName: String, lastName: String, phone: String, line1: String, line2: String, city: String, pincode: String
  },
  referralCode: { type: String, default: null },
  socialApplied: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
