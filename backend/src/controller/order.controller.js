// src/controller/order.controller.js
const Order   = require('../models/Order');
const Product = require('../models/Product');

// ── POST /api/orders  (public — guest checkout allowed) ──────────────────
// T-01: No JWT required. This is a WhatsApp boutique — the seller manages
//       the relationship via WhatsApp after order is created.
// Body: { items: [{ productId, name, price, quantity, size }], address, total }
exports.placeOrder = async (req, res, next) => {
  try {
    const { items, address, total, referralCode, socialApplied } = req.body;

    // Basic guard — always recalculate server-side in production
    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Order must have at least one item' });
    }

    // Snapshot prices from DB to prevent client-side price tampering
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findOne({ _id: item.productId, isActive: true });
        if (!product) throw Object.assign(new Error(`Product not found: ${item.productId}`), { statusCode: 404 });
        return {
          product: product._id,
          name:     product.name,        // Snapshot — name at time of order
          price:    product.price,       // Snapshot — server price, NOT client price
          quantity: item.quantity,
          size:     item.size || null,
        };
      })
    );

    // Recalculate total server-side
    const serverTotal = enrichedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await Order.create({
      user:    req.user?.id ?? null,  // null for guest orders — WhatsApp is the CRM
      items:   enrichedItems,
      total:   serverTotal,
      address: address || {},
      referralCode: referralCode || null,
      socialApplied: Boolean(socialApplied),
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) { next(err); }
};

// ── GET /api/orders/my  (authenticated customer — their own orders) ──
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order
      .find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name images');  // Attach current image for UI

    res.json({ success: true, data: orders });
  } catch (err) { next(err); }
};

// ── GET /api/orders/:id  (owner or admin) ────────────────────────
// optionalAuth middleware runs before this — req.user is set if token present.
// WHY 404 not 403 for non-owners: avoids confirming the order ID is valid.
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order
      .findById(req.params.id)
      .populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isAdmin = req.user?.role === 'admin';
    const isOwner = order.user && req.user?.id &&
      order.user.toString() === req.user.id;

    // Guest orders (order.user === null) are not exposed publicly after creation
    if (!isAdmin && !isOwner) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Mask phone for non-admin viewers (DPDP Act compliance)
    const orderData = order.toObject();
    if (!isAdmin && orderData.address?.phone) {
      orderData.address.phone = orderData.address.phone.replace(/\d(?=\d{4})/g, '*');
    }

    res.json({ success: true, data: orderData });
  } catch (err) { next(err); }
};

// ── PUT /api/orders/:id/status  (admin only) ─────────────────────
// Body: { status: 'confirmed' | 'shipped' | 'delivered' | 'cancelled' }
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowed.join(', ')}`,
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({ success: true, data: order });
  } catch (err) { next(err); }
};

// ── GET /api/orders  (admin only — all orders) ───────────────────
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 })
        .populate('user', 'name email'),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
};
