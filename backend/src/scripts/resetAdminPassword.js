// src/scripts/resetAdminPassword.js
// One-time script to force-reset the admin password.
// Run: node src/scripts/resetAdminPassword.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const ADMIN_EMAIL    = 'admin@yadhra.com';
const NEW_PASSWORD   = 'YadhraAdmin2026!';

async function reset() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  const hash = await bcrypt.hash(NEW_PASSWORD, 12);
  console.log('Generated hash:', hash);

  const result = await mongoose.connection.collection('users').updateOne(
    { email: ADMIN_EMAIL },
    {
      $set: {
        password:      hash,
        refreshTokens: [],          // Clear all existing sessions
      },
    }
  );

  console.log(`\nUpdate result: matched=${result.matchedCount}, modified=${result.modifiedCount}`);

  if (result.matchedCount === 0) {
    console.log('❌ Admin user not found! Run seedAdmin.js first.');
  } else {
    console.log('✅ Password reset successfully!');
    console.log(`   Email   : ${ADMIN_EMAIL}`);
    console.log(`   Password: ${NEW_PASSWORD}`);
  }

  await mongoose.disconnect();
  console.log('\n✅ Done.');
}

reset().catch(err => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});
