// src/controller/auth.controller.js
// Full JTI-based refresh token implementation.
// Token lifecycle: issue → use → rotate → revoke
// Theft detection: if a JTI is reused after rotation, ALL sessions are invalidated.

const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const User   = require('../models/User');

// ── Cookie options — single source of truth ────────────────────────────────
// WHY path '/api/auth': cookie is only sent to auth endpoints, not to
// /api/products, /api/orders etc. — reduces the surface where it travels.
const REFRESH_COOKIE_OPTS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path:     '/api/auth',
};

const RT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ── Issue both tokens + JTI ────────────────────────────────────────────────
function issueTokens(userId, role) {
  const jti = crypto.randomUUID();

  const accessToken = jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m', algorithm: 'HS256' }
  );

  const refreshToken = jwt.sign(
    { id: userId, jti },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d', algorithm: 'HS256' }
  );

  return { accessToken, refreshToken, jti };
}

// ── REGISTER ──────────────────────────────────────────────────────────────
// validateRegister middleware runs before this — all fields are pre-validated.
// WHY explicit destructuring: role in req.body is ignored even if sneaked in.
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    // role defaults to 'customer' — never read from req.body
    const user = await User.create({ name, email, password });

    const { accessToken, refreshToken, jti } = issueTokens(user._id, user.role);
    user.refreshTokens.push({ jti, expiresAt: new Date(Date.now() + RT_TTL_MS) });
    await user.save();

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTS);
    res.status(201).json({
      success: true,
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) { next(err); }
};

// ── LOGIN ─────────────────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // +password because schema has select:false — never returned by default
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      // Identical response for wrong email AND wrong password — prevents enumeration
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken, jti } = issueTokens(user._id, user.role);
    user.refreshTokens.push({ jti, expiresAt: new Date(Date.now() + RT_TTL_MS) });
    await user.save(); // pre-save hook prunes expired JTIs automatically

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTS);
    res.json({
      success: true,
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) { next(err); }
};

// ── REFRESH ────────────────────────────────────────────────────────────────
exports.refresh = async (req, res, next) => {
  try {
    const incoming = req.cookies.refreshToken;
    if (!incoming) {
      return res.status(401).json({ success: false, message: 'No refresh token' });
    }

    // Verify signature and expiry
    let decoded;
    try {
      decoded = jwt.verify(incoming, process.env.REFRESH_TOKEN_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: 'Refresh token invalid or expired' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // ── Token reuse / theft detection ─────────────────────────────────────
    // If the JTI is NOT in the user's valid list, this token was already
    // rotated (or stolen after logout). Invalidate ALL sessions immediately.
    const tokenIndex = user.refreshTokens.findIndex(t => t.jti === decoded.jti);
    if (tokenIndex === -1) {
      user.refreshTokens = []; // Nuclear option — logout all devices
      await user.save();
      res.clearCookie('refreshToken', { path: '/api/auth' });
      return res.status(401).json({
        success: false,
        message: 'Token reuse detected. All sessions have been invalidated. Please log in again.',
      });
    }

    // Remove old JTI and issue fresh tokens (rotation)
    user.refreshTokens.splice(tokenIndex, 1);
    const { accessToken, refreshToken, jti } = issueTokens(user._id, user.role);
    user.refreshTokens.push({ jti, expiresAt: new Date(Date.now() + RT_TTL_MS) });
    await user.save();

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTS);
    res.json({
      success: true,
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) { next(err); }
};

// ── LOGOUT ────────────────────────────────────────────────────────────────
exports.logout = async (req, res, next) => {
  try {
    const incoming = req.cookies.refreshToken;
    if (incoming) {
      try {
        const decoded = jwt.verify(incoming, process.env.REFRESH_TOKEN_SECRET);
        const user    = await User.findById(decoded.id);
        if (user) {
          // Remove only THIS device's JTI — other devices stay logged in
          user.refreshTokens = user.refreshTokens.filter(t => t.jti !== decoded.jti);
          await user.save();
        }
      } catch {
        // Token invalid/expired — still proceed with cookie clear
      }
    }

    res.clearCookie('refreshToken', { path: '/api/auth' });
    res.json({ success: true, message: 'Logged out' });
  } catch (err) { next(err); }
};

// ── ME — current user profile ─────────────────────────────────────────────
exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshTokens');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { next(err); }
};
