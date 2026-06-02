const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // ── Connection pool ──────────────────────────────────────────────
      // Reuse connections instead of creating new ones per request.
      // Default is 5; bumped to 10 for better concurrency under load.
      maxPoolSize: 10,
      minPoolSize: 2,             // Keep 2 connections warm at all times

      // ── Timeouts ─────────────────────────────────────────────────────
      serverSelectionTimeoutMS: 5000,  // Fail fast if can't reach Atlas
      socketTimeoutMS: 45000,          // Kill idle sockets after 45s
      connectTimeoutMS: 10000,         // Initial connection timeout
    });
    console.log(`MongoDB connected: ${conn.connection.host} ${conn.connection.port}`);
  } catch (error) {
    console.error('MongoDB connection FAILED:', error.message);
    process.exit(1); // Stop the server — no point running without DB
  }
};

module.exports = connectDB;
