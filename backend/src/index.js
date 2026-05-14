// src/index.js
// Production-grade Express server.
// Middleware order is not arbitrary — see comments on each section.
// Deployed on Render (backend) with Vercel frontend.

require('dotenv').config();
const express      = require('express');
const helmet       = require('helmet');
const cors         = require('cors');
const rateLimit    = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const connectDB    = require('./config/db');

// Route files
const authRoutes     = require('./routes/auth.routes');
const productRoutes  = require('./routes/product.routes');
const orderRoutes    = require('./routes/order.routes');
const uploadRoutes   = require('./routes/upload.routes');
const customerRoutes = require('./routes/customer.routes');

const { errorHandler } = require('./middleware/errorhanlder');

const app    = express();
const isProd = process.env.NODE_ENV === 'production';

// ── 1. Security headers — FIRST, before any response leaves the server ──────
// helmet sets 11 headers: CSP, HSTS, X-Frame-Options, etc.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", "data:", "https://res.cloudinary.com", "https://*.cloudinary.com"],
      // api.cloudinary.com is needed for direct browser → Cloudinary signed uploads.
      connectSrc: ["'self'", process.env.CLIENT_URL, "https://*.cloudinary.com", "https://api.cloudinary.com"].filter(Boolean),
      frameSrc:   ["'none'"],
      objectSrc:  ["'none'"],
    },
  },
  hsts: isProd
    ? { maxAge: 63072000, includeSubDomains: true, preload: true }
    : false, // HSTS only in production — breaks localhost dev
}));

// ── 2. CORS ─────────────────────────────────────────────────────────────────
// In prod: CLIENT_URL must be the Vercel app URL e.g. https://yadhra.vercel.app
const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:3001',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);          // Postman / curl
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    if (!isProd) return callback(null, true);          // Dev: allow unknown ports
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials:    true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: [],
  maxAge:         86400, // Cache preflight for 24 hours
}));

// ── 3. Rate limiting — BEFORE body parsing to stop floods cheaply ────────────
// Auth endpoints: 10 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs:               15 * 60 * 1000,
  max:                    10,
  standardHeaders:        true,
  legacyHeaders:          false,
  skipSuccessfulRequests: false,
  message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' },
});

// General API: 200 requests per minute (generous for a boutique store)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max:      200,
  message:  { success: false, message: 'Rate limit exceeded. Please slow down.' },
});

app.use('/api/auth/login',    authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/',              apiLimiter);

// ── 4. Cross-origin cookie patching ─────────────────────────────────────────
// In production, Vercel (frontend) and Render (backend) are different domains.
// sameSite:'none' + secure:true is required for httpOnly cookies cross-origin.
app.use((req, res, next) => {
  const originalCookie = res.cookie.bind(res);
  res.cookie = (name, val, opts = {}) => originalCookie(name, val, {
    ...opts,
    sameSite: isProd ? 'none' : (opts.sameSite ?? 'lax'),
    secure:   isProd ? true   : (opts.secure   ?? false),
  });
  next();
});

// ── 5. Body parsing ──────────────────────────────────────────────────────────
app.use(cookieParser());
app.use(express.json({ limit: '100kb' }));        // Prevent payload flooding
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// ── 6. Structured request logging ────────────────────────────────────────────
// WHY JSON: makes logs parseable by Render's log aggregation.
// WHY on 'finish': ensures we capture the response status code.
// NEVER log request bodies — they contain passwords and PII.
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms    = Date.now() - start;
    const level = res.statusCode >= 500 ? 'ERROR'
                : res.statusCode >= 400 ? 'WARN'
                : 'INFO';
    console.log(JSON.stringify({
      level,
      method:   req.method,
      path:     req.path,
      status:   res.statusCode,
      duration: `${ms}ms`,
      ip:       req.ip,
      // ua: req.get('user-agent'), // Uncomment if needed for analytics
    }));
  });
  next();
});

// ── 7. Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/products',  productRoutes);
app.use('/api/orders',    orderRoutes);
app.use('/api/upload',    uploadRoutes);
app.use('/api/customers', customerRoutes);

// ── 8. Health check ──────────────────────────────────────────────────────────
const mongoose = require('mongoose');

app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState; // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  const dbStatus = dbState === 1 ? 'connected' : 'disconnected';
  const status = dbState === 1 ? 'ok' : 'error';
  const httpCode = status === 'ok' ? 200 : 503;
  
  res.status(httpCode).json({
    status,
    db: dbStatus,
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// ── 8a. Root endpoint ────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    name: 'Yadhra Closet API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      orders: '/api/orders',
      auth: '/api/auth',
      upload: '/api/upload',
      customers: '/api/customers',
    },
  });
});

// ── 9. 404 catch-all ─────────────────────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` })
);

// ── 10. Global error handler — MUST be last ──────────────────────────────────
app.use(errorHandler);

// ── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(JSON.stringify({
      level:  'INFO',
      event:  'server_start',
      port:   PORT,
      env:    process.env.NODE_ENV || 'development',
    }))
  );
});
