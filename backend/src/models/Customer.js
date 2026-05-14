const mongoose = require('mongoose');

// ── Helper: generate a unique 6-character referral code ──────────────────
// WHY this format: short enough to type on a phone, unique enough for
// a small customer base, human-readable (no 0/O or 1/I confusion)
function generateReferralCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return 'YC-' + Array.from({ length: 4 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
  // Example output: YC-K7MR
}

const customerSchema = new mongoose.Schema({

  // ── Basic contact details ──────────────────────────────────────────────
  name:  { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true, default: null },

  // ── Their own referral code (auto-generated, unique per customer) ──────
  // WHY unique: two customers cannot have the same code — MongoDB will
  // reject the save if a collision happens (extremely rare with this format)
  myReferralCode: {
    type:    String,
    unique:  true,
    default: generateReferralCode,
  },

  // ── The code they entered when they arrived (who referred them) ────────
  // WHY not required: the first customers have no referrer.
  // WHY String not ObjectId: we store the code string, not the referrer's
  // _id, because the referrer's _id is unknown at submission time.
  referredBy: {
    type:    String,
    default: null,
  },

  // ── Was the referral code they entered valid? ──────────────────────────
  // WHY store this: makes it easy to query "all customers who came through
  // a valid referral" without re-checking every time.
  referralValid: {
    type:    Boolean,
    default: false,
  },

  // ── The actual customer who referred them (set if code was valid) ──────
  referredByCustomer: {
    type:    mongoose.Schema.Types.ObjectId,
    ref:     'Customer',
    default: null,
  },

}, { timestamps: true }); // adds createdAt and updatedAt automatically

module.exports = mongoose.model('Customer', customerSchema);
