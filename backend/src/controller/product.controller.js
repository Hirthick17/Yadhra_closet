// src/controller/product.controller.js
// All public READ endpoints are cached in-memory (node-cache).
// Admin WRITE endpoints bust the cache so the next read is fresh.
// .lean() on all reads returns plain JS objects (~3-5x faster than Mongoose docs).

const Product = require('../models/Product');
const { productListCache, productCache, categoryCache, bustProductCache } = require('../config/cache');

// ── Fields to include in list responses (saves bandwidth) ────────────────
// Excludes heavy fields: description, outOfStockSizes
const LIST_PROJECTION = {
  slug: 1, name: 1, subtitle: 1, category: 1, categoryLabel: 1,
  price: 1, oldPrice: 1, image: 1, images: 1, colors: 1, sizes: 1,
  rating: 1, ratingCount: 1, badge: 1, stock: 1, isActive: 1, createdAt: 1,
};

// ── GET /api/products/categories ──────────────────────────────
// Returns distinct categories (slug + label) from active products.
// Powers the admin category pane and dynamic catalog filter tabs.
exports.getCategories = async (req, res, next) => {
  try {
    const cacheKey = 'categories';
    const cached = categoryCache.get(cacheKey);
    if (cached) {
      res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=600');
      res.set('X-Cache', 'HIT');
      return res.json(cached);
    }

    const start = Date.now();
    // Aggregate distinct categories with their labels
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: {
        _id: '$category',
        categoryLabel: { $first: '$categoryLabel' },
        count: { $sum: 1 }
      }},
      { $project: { _id: 0, slug: '$_id', label: '$categoryLabel', count: 1 } },
      { $sort: { slug: 1 } },
    ]);

    const response = { success: true, data: categories };
    categoryCache.set(cacheKey, response);

    console.log(JSON.stringify({
      level: 'INFO', event: 'db_query', endpoint: 'getCategories',
      ms: Date.now() - start, cached: false,
    }));

    res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=600');
    res.set('X-Cache', 'MISS');
    res.json(response);
  } catch (err) { next(err); }
};

// ── GET /api/products ─────────────────────────────────────────
// Supports: ?category=festive&search=blue&badge=new&page=1&limit=20
exports.getProducts = async (req, res, next) => {
  try {
    const { category, search, badge, page = 1, limit = 20 } = req.query;

    // Build a stable cache key from query params
    const cacheKey = JSON.stringify({ category, search, badge, page, limit });
    const cached = productListCache.get(cacheKey);
    if (cached) {
      res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
      res.set('X-Cache', 'HIT');
      return res.json(cached);
    }

    const start = Date.now();
    const filter = { isActive: true }; // Never return soft-deleted products

    if (category) filter.category = category;          // slug: everyday|festive|floral|minimal
    if (badge)    filter.badge    = badge;              // new|sale
    if (search)   filter.$text   = { $search: search }; // Uses text index on name+description

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter)
        .select(LIST_PROJECTION)
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 })
        .lean(),                                        // Plain JS objects — ~3-5x faster
      Product.countDocuments(filter),
    ]);

    const response = {
      success: true,
      data: products,
      pagination: {
        page:  Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    };

    productListCache.set(cacheKey, response);

    console.log(JSON.stringify({
      level: 'INFO', event: 'db_query', endpoint: 'getProducts',
      ms: Date.now() - start, cached: false, total,
      filter: { category, search, badge, page, limit },
    }));

    // Cache public product listing: fresh for 60s, stale-while-revalidate 5 min
    // This dramatically reduces load for repeated visitors and CDN caching.
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    res.set('X-Cache', 'MISS');
    res.json(response);
  } catch (err) { next(err); }
};

// ── GET /api/products/:id ─────────────────────────────────────
// Supports BOTH slug (e.g. "blossom-linen") and MongoDB ObjectId
// Frontend TanStack Router uses slug-based IDs: /product/$id
exports.getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const cached = productCache.get(id);
    if (cached) {
      res.set('X-Cache', 'HIT');
      return res.json(cached);
    }

    const start = Date.now();
    // Try slug first (frontend uses slug), fall back to ObjectId
    const isObjectId = /^[a-f\d]{24}$/i.test(id);
    const query = isObjectId
      ? { _id: id,   isActive: true }
      : { slug: id,  isActive: true };

    const product = await Product.findOne(query).lean();
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const response = { success: true, data: product };
    productCache.set(id, response);

    console.log(JSON.stringify({
      level: 'INFO', event: 'db_query', endpoint: 'getProduct',
      ms: Date.now() - start, cached: false, id,
    }));

    res.set('X-Cache', 'MISS');
    res.json(response);
  } catch (err) { next(err); }
};

// ── POST /api/products  (admin only) ─────────────────────────
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    bustProductCache(); // Clear all caches — new product affects listings & categories
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
    bustProductCache(); // Clear all caches — update may affect category/listing
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
};

// ── DELETE /api/products/:id  (admin — soft delete) ──────────
exports.deleteProduct = async (req, res, next) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    bustProductCache(); // Clear all caches — deletion affects listings & categories
    res.json({ success: true, message: 'Product removed' });
  } catch (err) { next(err); }
};

// ── GET /api/products/cache-stats (admin/debug) ──────────────
// Exposes cache hit/miss stats for monitoring.
// Only available in development or when explicitly enabled.
exports.getCacheStats = async (req, res) => {
  const { getCacheStats } = require('../config/cache');
  res.json({ success: true, data: getCacheStats() });
};
