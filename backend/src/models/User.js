// src/models/User.js
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },
  role:     { type: String, enum: ['customer', 'admin'], default: 'customer' },

  // ── JTI-based refresh token store ─────────────────────────────────────────
  // WHY array (not single string): supports multiple devices simultaneously.
  // WHY jti per token: if a token is reused after logout, that specific jti
  // won't be found → we know the token was stolen → invalidate ALL sessions.
  refreshTokens: [{
    jti:       { type: String, required: true },
    issuedAt:  { type: Date,   default: Date.now },
    expiresAt: { type: Date,   required: true },
    _id:       false, // Sub-documents don't need their own _id
  }],

}, { timestamps: true });

// ── Pre-save: prune expired JTIs + hash password if changed ─────────────
// WHY no `next` param: Mongoose 7+ async middleware returns a Promise
// automatically. Passing `next` and calling it inside an async function
// causes "next is not a function" at runtime in this Mongoose version.
userSchema.pre('save', async function () {
  // 1. Prune expired refresh-token JTIs on every save
  const now = new Date();
  this.refreshTokens = this.refreshTokens.filter(t => t.expiresAt > now);

  // 2. Hash the password only when it has been changed (or is new)
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

// ── Compare password on login ─────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
