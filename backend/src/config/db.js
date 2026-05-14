const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host} ${conn.connection.port}`);
  } catch (error) {
    console.error('MongoDB connection FAILED:', error.message);
    process.exit(1); // Stop the server — no point running without DB
  }
};

module.exports = connectDB;
