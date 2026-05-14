// src/routes/order.routes.js
// T-01: POST / is public — no JWT for guest WhatsApp checkout.
// GET /:id now uses optionalAuth so the controller can enforce ownership.
const router = require('express').Router();
const ctrl   = require('../controller/order.controller');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');

router.post('/',          ctrl.placeOrder);                          // POST   /api/orders       (public — guest)
router.get('/my',         protect, ctrl.getMyOrders);               // GET    /api/orders/my     (authenticated)
router.get('/',           protect, adminOnly, ctrl.getAllOrders);    // GET    /api/orders        (admin)
router.get('/:id',        optionalAuth, ctrl.getOrder);             // GET    /api/orders/:id    (owner or admin — no longer fully public)
router.put('/:id/status', protect, adminOnly, ctrl.updateOrderStatus); // PUT /api/orders/:id/status (admin)

module.exports = router;
