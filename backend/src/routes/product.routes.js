// src/routes/product.routes.js
const router = require('express').Router();
const ctrl   = require('../controller/product.controller');
const { protect, adminOnly } = require('../middleware/auth');
const { validateProduct } = require('../middleware/validate');

// ── PUBLIC ──────────────────────────────────────────────────────────────────
router.get('/',    ctrl.getProducts);  // GET /api/products?category=festive&search=blue
router.get('/:id', ctrl.getProduct);   // GET /api/products/:id

// ── ADMIN ONLY — validation runs before controller ─────────────────────────
// validateProduct rejects unknown fields and enforces types before any DB write.
router.post('/',      protect, adminOnly, validateProduct, ctrl.createProduct);
router.put('/:id',    protect, adminOnly, validateProduct, ctrl.updateProduct);
router.delete('/:id', protect, adminOnly, ctrl.deleteProduct);

module.exports = router;
