// src/scripts/restore_db.js
// Script to restore MongoDB data from backup JSON files in D:\OneDrive\Documents\Industry_Projects\Ecommerce_for_pavithracreations\yadhra_closet\database

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Load environment variables from backend/.env
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const connectDB = require('../config/db');

// Import Mongoose Models
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

const BACKUP_DIR = 'D:\\OneDrive\\Documents\\Industry_Projects\\Ecommerce_for_pavithracreations\\yadhra_closet\\database';

// Helper to convert MongoDB Extended JSON formats to standard JS/Mongoose types
function convertExtendedJson(obj) {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => convertExtendedJson(item));
  }

  if (typeof obj === 'object') {
    // Convert $oid to mongoose Types.ObjectId
    if (obj.$oid && typeof obj.$oid === 'string') {
      return new mongoose.Types.ObjectId(obj.$oid);
    }
    // Convert $date to Date object
    if (obj.$date) {
      if (typeof obj.$date === 'string') {
        return new Date(obj.$date);
      }
      if (obj.$date.$numberLong) {
        return new Date(parseInt(obj.$date.$numberLong, 10));
      }
    }

    // Recurse down into keys
    const newObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = convertExtendedJson(obj[key]);
      }
    }
    return newObj;
  }

  return obj;
}

async function restoreCollection(model, fileName, collectionName) {
  const filePath = path.join(BACKUP_DIR, fileName);
  console.log(`\n📂 Reading backup file: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Error: Backup file not found: ${filePath}`);
    return;
  }

  const fileData = fs.readFileSync(filePath, 'utf8');
  let docsJson;
  try {
    docsJson = JSON.parse(fileData);
  } catch (err) {
    console.error(`❌ Error parsing JSON for ${collectionName}:`, err.message);
    return;
  }

  const convertedDocs = convertExtendedJson(docsJson);
  console.log(`⚙️  Converted ${convertedDocs.length} documents for ${collectionName}`);

  console.log(`🧹 Clearing collection: ${collectionName}...`);
  await model.deleteMany({});

  console.log(`📥 Inserting documents into collection: ${collectionName}...`);
  const result = await model.insertMany(convertedDocs);
  console.log(`✅ Successfully restored ${result.length} documents in ${collectionName}`);
}

async function runRestore() {
  console.log('🔌 Connecting to MongoDB...');
  await connectDB();
  console.log('✅ Connected successfully!');

  // Restore each collection
  await restoreCollection(User, 'yadhra_closet.users.json', 'users');
  await restoreCollection(Product, 'yadhra_closet.products.json', 'products');
  await restoreCollection(Customer, 'yadhra_closet.customers.json', 'customers');
  await restoreCollection(Order, 'yadhra_closet.orders.json', 'orders');

  console.log('\n🎉 Database restore operation completed successfully!');
  process.exit(0);
}

runRestore().catch(err => {
  console.error('\n❌ Database restore operation failed:', err);
  process.exit(1);
});
