// src/middleware/errorhanlder.js
// NOTE: filename has a deliberate typo retained from scaffold — do NOT rename
// (index.js already imports it by this exact name).

// Mongoose sends specific error names — we translate them to user-friendly messages.
// This is the LAST middleware in index.js — receives any error passed via next(err).
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || 'Internal Server Error';

  // Mongoose: invalid ObjectId (e.g. /api/products/not-an-id)
  if (err.name === 'CastError') {
    statusCode = 404;
    message    = `Resource not found with id: ${err.value}`;
  }

  // Mongoose: duplicate unique field (e.g. email already registered)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message    = `${field} already exists`;
  }

  // Mongoose: schema validation failed (e.g. price < 0, missing required field)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message    = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError')  { statusCode = 401; message = 'Invalid token'; }
  if (err.name === 'TokenExpiredError')  { statusCode = 401; message = 'Token expired'; }

  // Log full stack in development only — never leak stack traces to production clients
  if (process.env.NODE_ENV !== 'production') {
    console.error('[ErrorHandler]', err);
  }

  // Always return the same JSON shape — frontend can rely on { success, message }
  res.status(statusCode).json({ success: false, message });
};

module.exports = { errorHandler };
