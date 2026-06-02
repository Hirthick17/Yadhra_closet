// src/config/cache.js
// In-memory caching layer for product data.
// Uses node-cache (process-local) — perfect for single-instance Render deployment.
// If you ever scale to multiple instances, swap this for Redis.
//
// TTL strategy:
//   Products list:    2 min  — balances freshness vs DB load
//   Single product:   5 min  — individual pages change rarely
//   Categories:       5 min  — almost never changes
//
// Cache is auto-busted on admin create/update/delete via bustProductCache().

const NodeCache = require('node-cache');

// ── Product list cache ──────────────────────────────────────────────────────
// Key format: "products:<JSON of query params>"
// Example:    "products:{\"category\":\"kurti\",\"page\":1,\"limit\":20}"
const productListCache = new NodeCache({
  stdTTL:      120,   // 2 minutes
  checkperiod: 60,    // Cleanup expired keys every 60s
  useClones:   false, // Return references for speed (we never mutate cached data)
});

// ── Single product cache ────────────────────────────────────────────────────
// Key format: "product:<slug-or-id>"
const productCache = new NodeCache({
  stdTTL:      300,   // 5 minutes
  checkperiod: 120,
  useClones:   false,
});

// ── Categories cache ────────────────────────────────────────────────────────
// Key: "categories" (only one entry)
const categoryCache = new NodeCache({
  stdTTL:      300,   // 5 minutes
  checkperiod: 120,
  useClones:   false,
});

// ── Cache busting ───────────────────────────────────────────────────────────
// Called after any admin create/update/delete operation.
// Flushes ALL cached data so the next read fetches fresh from MongoDB.
function bustProductCache() {
  productListCache.flushAll();
  productCache.flushAll();
  categoryCache.flushAll();

  console.log(JSON.stringify({
    level: 'INFO',
    event: 'cache_bust',
    message: 'All product caches cleared',
    timestamp: new Date().toISOString(),
  }));
}

// ── Stats (for debugging/monitoring) ────────────────────────────────────────
function getCacheStats() {
  return {
    productList: productListCache.getStats(),
    product:     productCache.getStats(),
    category:    categoryCache.getStats(),
  };
}

module.exports = {
  productListCache,
  productCache,
  categoryCache,
  bustProductCache,
  getCacheStats,
};
