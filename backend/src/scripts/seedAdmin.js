// src/scripts/seedAdmin.js
// Creates the one admin user for the Yadhra Closet CMS.
// Run: node src/scripts/seedAdmin.js
//
// ⚠️  CHANGE THE PASSWORD BELOW before running in production.
// ⚠️  Delete this script or add it to .gitignore after first run.

require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('../models/User');

// ── Configure admin credentials here ─────────────────────────────────────────
const ADMIN_EMAIL    = 'admin@yadhra.com';
const ADMIN_PASSWORD = 'YadhraAdmin2026!';  // Change this before production!
const ADMIN_NAME     = 'Yadhra Admin';
// ─────────────────────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  // Check if admin already exists
  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log(`ℹ️  Admin already exists: ${ADMIN_EMAIL}`);
    console.log(`   Role: ${existing.role}`);
    if (existing.role !== 'admin') {
      // Upgrade to admin if needed
      existing.role = 'admin';
      await existing.save();
      console.log('✅ Role upgraded to admin');
    } else {
      console.log('   No changes needed.');
    }
    await mongoose.disconnect();
    return;
  }

  // Create new admin user
  // WHY direct role set here: this is a one-time seed script, not a public API
  const admin = new User({
    name:     ADMIN_NAME,
    email:    ADMIN_EMAIL,
    password: ADMIN_PASSWORD,  // Hashed automatically by pre-save hook
    role:     'admin',
  });
  await admin.save();

  console.log('✅ Admin user created successfully!\n');
  console.log('─'.repeat(40));
  console.log(`  Email   : ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log(`  Role    : admin`);
  console.log('─'.repeat(40));
  console.log('\n⚠️  Save these credentials securely.');
  console.log('⚠️  Change the password after first login.');

  await mongoose.disconnect();
  console.log('\n✅ Done. Disconnected from MongoDB.');
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
