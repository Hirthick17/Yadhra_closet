// src/controller/product.controller.js
const Product = require('../models/Product');

// ── GET /api/products ─────────────────────────────────────────
// Supports: ?category=festive&search=blue&badge=new&page=1&limit=20
exports.getProducts = async (req, res, next) => {
  try {
    const { category, search, badge, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true }; // Never return soft-deleted products

    if (category) filter.category = category;          // slug: everyday|festive|floral|minimal
    if (badge)    filter.badge    = badge;              // new|sale
    if (search)   filter.$text   = { $search: search }; // Uses text index on name+description

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        page:  Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) { next(err); }
};

// ── GET /api/products/:id ─────────────────────────────────────
// Supports BOTH slug (e.g. "blossom-linen") and MongoDB ObjectId
// Frontend TanStack Router uses slug-based IDs: /product/$id
exports.getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Try slug first (frontend uses slug), fall back to ObjectId
    const isObjectId = /^[a-f\d]{24}$/i.test(id);
    const query = isObjectId
      ? { _id: id,   isActive: true }
      : { slug: id,  isActive: true };

    const product = await Product.findOne(query);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (err) { next(err); }
};

// ── POST /api/products  (admin only) ─────────────────────────
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) { next(err); }
};

// ── PUT /api/products/:id  (admin only) ──────────────────────
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
};

// ── DELETE /api/products/:id  (admin — soft delete) ──────────
exports.deleteProduct = async (req, res, next) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Product removed' });
  } catch (err) { next(err); }
};
