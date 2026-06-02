// src/scripts/migrateCategories.js
// Run with: node src/scripts/migrateCategories.js
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const connectDB = require('../config/db');

const CATEGORY_MAP = {
  'blossom-linen': { category: 'kurti', categoryLabel: 'Kurti' },
  'clay-cotton': { category: 'kurti', categoryLabel: 'Kurti' },
  'indigo-embroidered': { category: 'short-kurti', categoryLabel: 'Short Kurti' },
  'sage-garden': { category: 'peplum-tops', categoryLabel: 'Peplum Tops' },
  'golden-thread': { category: 'maxi', categoryLabel: 'Maxi' },
  'coral-silk': { category: 'co-ord-set', categoryLabel: 'Co-ord Set' }
};

// Also map existing category values just in case there are other custom products
const FALLBACK_MAP = {
  'everyday': { category: 'kurti', categoryLabel: 'Kurti' },
  'festive': { category: 'maxi', categoryLabel: 'Maxi' },
  'floral': { category: 'peplum-tops', categoryLabel: 'Peplum Tops' },
  'minimal': { category: 'kurti', categoryLabel: 'Kurti' }
};

async function migrate() {
  await connectDB();
  console.log('🤖 Starting categories migration...');

  const products = await Product.find({});
  console.log(`Found ${products.length} products in DB.`);

  let updatedCount = 0;
  for (const p of products) {
    let update = CATEGORY_MAP[p.slug];
    if (!update) {
      update = FALLBACK_MAP[p.category];
    }
    
    if (update) {
      p.category = update.category;
      p.categoryLabel = update.categoryLabel;
      await p.save();
      console.log(`✅ Updated [${p.slug}]: ${p.category} -> ${p.categoryLabel}`);
      updatedCount++;
    } else {
      console.log(`⚠️  Skipped [${p.slug}] (already formatted or no map): ${p.category}`);
    }
  }

  console.log(`\n🎉 Migration complete. Updated ${updatedCount} products.\n`);
  process.exit(0);
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
