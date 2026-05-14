// src/config/seed.js
// Run with: npm run seed
// Seeds: 6 Yadhra Closet products + 1 admin user
// Products match the exact data in frontend/src/lib/store.ts

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const Product = require('../models/Product');
const User    = require('../models/User');
const connectDB = require('./db');

// ── SEED DATA ──────────────────────────────────────────────────
// Matches store.ts PRODUCTS array exactly (same IDs, prices, ratings)
const PRODUCTS = [
  {
    slug:          'blossom-linen',
    name:          'Blossom Linen Kurti',
    subtitle:      'Summer Edition 2026',
    description:   'A breathable linen kurti with a relaxed silhouette, perfect for office and casual wear. Inspired by Chennai\'s coastal mornings.',
    category:      'everyday',
    categoryLabel: 'Everyday Wear',
    price:         699,
    oldPrice:      999,
    image:         '/images/kurti-blossom-linen.jpg',
    images:        ['/images/kurti-blossom-linen.jpg', '/images/kurti-sage-garden.jpg', '/images/kurti-clay-cotton.jpg', '/images/kurti-coral-silk.jpg'],
    colors:        ['#D9C2A7', '#0D1A63', '#7E8C5A', '#C95C5C', '#2B3642'],
    sizes:         ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    outOfStockSizes: ['XS'],
    rating:        4.9,
    ratingCount:   128,
    badge:         'new',
    stock:         50,
  },
  {
    slug:          'indigo-embroidered',
    name:          'Indigo Embroidered Kurta',
    subtitle:      'Festive Edition 2026',
    description:   'Intricate hand-embroidered detailing on premium indigo cotton. Statement piece for festive occasions.',
    category:      'festive',
    categoryLabel: 'Festive',
    price:         1099,
    oldPrice:      1499,
    image:         '/images/kurti-indigo-embroidered.jpg',
    images:        ['/images/kurti-indigo-embroidered.jpg'],
    colors:        ['#0D1A63', '#1B2B7A'],
    sizes:         ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    outOfStockSizes: [],
    rating:        4.7,
    ratingCount:   86,
    badge:         'sale',
    stock:         30,
  },
  {
    slug:          'sage-garden',
    name:          'Sage Garden Kurti',
    subtitle:      null,
    description:   'Soft floral prints on sage-green cotton. Light, flowy, and effortlessly graceful.',
    category:      'floral',
    categoryLabel: 'Floral Prints',
    price:         849,
    oldPrice:      null,
    image:         '/images/kurti-sage-garden.jpg',
    images:        ['/images/kurti-sage-garden.jpg'],
    colors:        ['#7E8C5A', '#D9C2A7'],
    sizes:         ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    outOfStockSizes: [],
    rating:        4.8,
    ratingCount:   73,
    badge:         null,
    stock:         40,
  },
  {
    slug:          'golden-thread',
    name:          'Golden Thread Kurti',
    subtitle:      'Festive Edition 2026',
    description:   'Zari golden thread work on rich cotton blend. Perfect for weddings and festivals.',
    category:      'festive',
    categoryLabel: 'Festive',
    price:         1299,
    oldPrice:      1799,
    image:         '/images/kurti-golden-thread.jpg',
    images:        ['/images/kurti-golden-thread.jpg'],
    colors:        ['#C9A96E', '#0D1A63'],
    sizes:         ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    outOfStockSizes: [],
    rating:        4.6,
    ratingCount:   54,
    badge:         'sale',
    stock:         25,
  },
  {
    slug:          'clay-cotton',
    name:          'Clay Cotton Kurti',
    subtitle:      null,
    description:   'Clean lines, minimal design, clay-toned cotton. The everyday essential that goes with everything.',
    category:      'minimal',
    categoryLabel: 'Minimal',
    price:         599,
    oldPrice:      null,
    image:         '/images/kurti-clay-cotton.jpg',
    images:        ['/images/kurti-clay-cotton.jpg'],
    colors:        ['#C95C5C', '#D9C2A7'],
    sizes:         ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    outOfStockSizes: [],
    rating:        4.8,
    ratingCount:   91,
    badge:         null,
    stock:         60,
  },
  {
    slug:          'coral-silk',
    name:          'Coral Silk Kurti',
    subtitle:      null,
    description:   'Luxurious silk blend in a warm coral tone. Drapes beautifully and catches light effortlessly.',
    category:      'festive',
    categoryLabel: 'Festive',
    price:         1499,
    oldPrice:      1999,
    image:         '/images/kurti-coral-silk.jpg',
    images:        ['/images/kurti-coral-silk.jpg'],
    colors:        ['#E08A8A', '#C9A96E'],
    sizes:         ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    outOfStockSizes: [],
    rating:        4.7,
    ratingCount:   47,
    badge:         'new',
    stock:         20,
  },
];

// ── SEED ADMIN USER ───────────────────────────────────────────
const ADMIN = {
  name:     'Yadhra Admin',
  email:    'admin@yadhra.com',
  password: 'Yadhra@2026!',  // Change this before going live
  role:     'admin',
};

// ── MAIN ──────────────────────────────────────────────────────
async function seed() {
  await connectDB();

  // ── Products ────────────────────────────────────────────────
  console.log('\n🌱 Seeding products...');
  await Product.deleteMany({}); // Clear existing
  const products = await Product.insertMany(PRODUCTS);
  console.log(`   ✅ ${products.length} products inserted`);
  products.forEach(p => console.log(`      • [${p.slug}] ${p.name} — ₹${p.price}`));

  // ── Admin User ──────────────────────────────────────────────
  console.log('\n🌱 Seeding admin user...');
  const existing = await User.findOne({ email: ADMIN.email });
  if (existing) {
    console.log('   ⚠️  Admin user already exists — skipping');
  } else {
    await User.create(ADMIN); // pre-save hook hashes password automatically
    console.log(`   ✅ Admin created: ${ADMIN.email}`);
  }

  console.log('\n✅ Seed complete!\n');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
