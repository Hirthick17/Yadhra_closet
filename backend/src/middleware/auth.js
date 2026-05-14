// src/middleware/auth.js
const jwt = require('jsonwebtoken');

// ── protect — requires a valid Bearer token ────────────────────────────────
// Attaches req.user = { id, role } for downstream handlers.
const protect = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    return res.status(401).json({ success: false, message });
  }
};

// ── adminOnly — must be used AFTER protect ─────────────────────────────────
// Returns 403 (access denied), not 404 — the resource exists, access is denied.
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

// ── optionalAuth — attaches req.user if token present, never rejects ──────
// Use on routes where auth is optional (e.g. GET /api/orders/:id).
// The controller then decides what data to return based on req.user.
const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET);
      req.user = { id: decoded.id, role: decoded.role };
    } catch {
      // Invalid/expired token on optional route — proceed as unauthenticated
      req.user = null;
    }
  }
  next();
};

module.exports = { protect, adminOnly, optionalAuth };
