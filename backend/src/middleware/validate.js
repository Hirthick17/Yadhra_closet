// src/middleware/validate.js
// Explicit field validation BEFORE controllers run.
// WHY not joi/zod: this codebase is small enough that hand-written validators
// are readable and dependency-free. Migrate to zod if the API surface grows.

// ── Product ────────────────────────────────────────────────────────────────
const ALLOWED_PRODUCT_FIELDS = new Set([
  'name','slug','description','subtitle','category','categoryLabel',
  'price','oldPrice','stock','rating','ratingCount','badge',
  'images','image','colors','sizes','outOfStockSizes','isActive',
]);

const VALID_CATEGORIES = new Set(['everyday','festive','floral','minimal']);

exports.validateProduct = (req, res, next) => {
  const { name, price, category, description } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2)
    errors.push('name must be at least 2 characters');

  if (price === undefined || typeof price !== 'number' || price < 0 || price > 1_000_000)
    errors.push('price must be a non-negative number below 10,00,000');

  if (!category || !VALID_CATEGORIES.has(category))
    errors.push(`category must be one of: ${[...VALID_CATEGORIES].join(', ')}`);

  if (!description || description.trim().length < 10)
    errors.push('description must be at least 10 characters');

  // Block parameter pollution — unknown fields could confuse Mongoose hooks
  const unknown = Object.keys(req.body).filter(k => !ALLOWED_PRODUCT_FIELDS.has(k));
  if (unknown.length > 0)
    errors.push(`Unknown fields rejected: ${unknown.join(', ')}`);

  if (errors.length > 0)
    return res.status(400).json({ success: false, message: errors.join('; ') });

  next();
};

// ── Auth — Register ────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name?.trim() || name.trim().length < 2)
    errors.push('name must be at least 2 characters');

  if (!email || !EMAIL_RE.test(email))
    errors.push('a valid email address is required');

  if (!password || password.length < 8)
    errors.push('password must be at least 8 characters');

  if (password?.length > 128)
    errors.push('password is too long (max 128 characters)');

  // Hard block: role cannot be set via the request body — ever
  // WHY explicit: even though User.create() uses an explicit field list,
  // this middleware adds a second line of defence and makes the intent clear.
  if ('role' in req.body) {
    return res.status(400).json({
      success: false,
      message: 'role cannot be set via registration',
    });
  }

  if (errors.length > 0)
    return res.status(400).json({ success: false, message: errors.join('; ') });

  next();
};

// ── Auth — Login ───────────────────────────────────────────────────────────
exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !EMAIL_RE.test(email))
    errors.push('email is required');

  if (!password)
    errors.push('password is required');

  if (errors.length > 0)
    return res.status(400).json({ success: false, message: errors.join('; ') });

  next();
};

// ── Customer — Create ──────────────────────────────────────────────────────
const PHONE_RE = /^\d{10}$/;

exports.validateCustomer = (req, res, next) => {
  const { name, phone } = req.body;
  const errors = [];

  if (!name?.trim() || name.trim().length < 2)
    errors.push('name must be at least 2 characters');

  if (!phone || !PHONE_RE.test(phone.replace(/\s/g, '')))
    errors.push('phone must be a 10-digit number');

  if (errors.length > 0)
    return res.status(400).json({ success: false, message: errors.join('; ') });

  next();
};
