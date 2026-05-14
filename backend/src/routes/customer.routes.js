// src/routes/customer.routes.js
const router = require('express').Router();
const ctrl   = require('../controller/customer.controller');
const { protect, adminOnly } = require('../middleware/auth');
const { validateCustomer } = require('../middleware/validate');

// POST /api/customers  — save customer + resolve referral code (public)
router.post('/', validateCustomer, ctrl.createCustomer);

// GET  /api/customers/verify-referral?code=YC-K7MR  — real-time check (public)
router.get('/verify-referral', ctrl.verifyReferral);

// GET  /api/customers  — admin: list all customers with referral data
router.get('/', protect, adminOnly, ctrl.getAllCustomers ?? ((req, res) =>
  res.json({ success: true, message: 'Customer list endpoint — implement getAllCustomers if needed' })
));

module.exports = router;
