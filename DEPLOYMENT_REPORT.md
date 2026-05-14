# 🚀 Yadhra Closet - Deployment Readiness Report

**Date:** May 14, 2026  
**Target:** Frontend → Vercel | Backend → Render  
**Reviewer:** Code Analysis

---

## 🔴 CRITICAL ISSUES (Must Fix Before Deployment)

### 1. Frontend Hardcoded localhost in Production Build ⚠️ FIX NEEDED

**File:** `frontend/.env`  
**Current Value:** `VITE_API_URL=http://localhost:3000/api`

**Problem:** This value will be baked into the production build if not overridden.

**Solution:** Create `frontend/.env.production` with:
```
VITE_API_URL=https://your-render-app.onrender.com/api
```

Then update Vercel environment variables to set `VITE_API_URL` to your Render backend URL.

---

### 3. Missing Health Check Implementation

**File:** `backend/src/index.js`  
**Line:** ~140-142

**Current:**
```javascript
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' })
);
```

**Problem:** Doesn't verify MongoDB connection - Render's health check may report success even when DB is down.

**Fix Required:**
```javascript
const mongoose = require('mongoose');

app.get('/api/health', async (req, res) => {
  const dbState = mongoose.connection.readyState; // 0=disconnected, 1=connected
  const status = dbState === 1 ? 'ok' : 'error';
  const httpCode = status === 'ok' ? 200 : 503;
  
  res.status(httpCode).json({ 
    status, 
    env: process.env.NODE_ENV || 'development',
    db: dbState === 1 ? 'connected' : 'disconnected'
  });
});
```

---

### 4. Missing REFRESH_TOKEN_EXPIRES_IN Environment Variable

**File:** `backend/render.yaml`

**Problem:** The refresh token uses this env var but it's not in render.yaml.

**Fix:** Add to render.yaml:
```yaml
- key: REFRESH_TOKEN_EXPIRES_IN
  value: 7d
```

---

## ✅ FIXES APPLIED

The following issues have been fixed in the codebase:

1. ✅ **MongoDB URI Logging Fixed** - `backend/src/config/db.js` no longer logs sensitive connection string
2. ✅ **Health Check Enhanced** - `backend/src/index.js` now verifies MongoDB connection status
3. ✅ **CSP Updated for Cloudinary** - Added `https://*.cloudinary.com` to imgSrc and connectSrc
4. ✅ **render.yaml verified** - REFRESH_TOKEN_EXPIRES_IN already present

---

## 🟠 HIGH PRIORITY ISSUES (Remaining)

### 5. Content Security Policy May Block Image Uploads

**File:** `backend/src/index.js`  
**Lines:** ~28-36

**Problem:** CSP allows Cloudinary for reading images but may block the upload form action.

**Current CSP imgSrc:**
```javascript
imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
```

**Fix Required - Add upload endpoint to CSP:**
```javascript
imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://*.cloudinary.com"],
connectSrc: ["'self'", process.env.CLIENT_URL, "https://*.cloudinary.com"].filter(Boolean),
```

---

### 6. Missing Admin Product Route Authorization

**File:** `backend/src/routes/product.routes.js`

**Problem:** Need to verify all write operations (POST, PUT, DELETE) are protected with `protect` and `adminOnly` middleware.

**Recommended check:** Ensure all product creation/update/deletion routes require admin authentication.

---

### 7. MongoDB Connection String Logging

**File:** `backend/src/config/db.js`  
**Line:** 6

**Current:**
```javascript
console.log(`MongoDB connected: ${conn.connection.host} ${conn.connection.port} ${process.env.MONGODB_URI}`);
```

**Problem:** Prints full MongoDB URI including credentials in logs!

**Fix Required:**
```javascript
console.log(`MongoDB connected: ${conn.connection.host} ${conn.connection.port}`);
```

---

## 🟡 MEDIUM PRIORITY ISSUES

### 8. CORS Origin Validation Issue

**File:** `backend/src/index.js`  
**Lines:** ~48-62

**Problem:** In production, if `CLIENT_URL` is not set, the backend will block ALL origins including your Vercel frontend.

**Fix:** Ensure `CLIENT_URL` is properly set in Render dashboard to your Vercel URL (e.g., `https://yadhra-closet.vercel.app`)

---

### 9. Render Free Tier Considerations

**File:** `backend/render.yaml`

- Free tier puts the service to sleep after 15 minutes of inactivity
- First request after sleep will be slow (cold start)
- Consider upgrading to Starter ($7/month) for always-on

---

### 10. Vercel Build Configuration

**File:** `frontend/vercel.json`

**Current:**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

**Note:** This is a SPA rewrite. Ensure all routes work correctly. For TanStack Router, this configuration is typically correct.

---

## ✅ SECURITY CHECKLIST - PASSED

| Security Feature | Status | Notes |
|-----------------|--------|-------|
| JWT Authentication | ✅ | Access + Refresh tokens with JTI |
| HTTP-only Cookies | ✅ | Refresh tokens stored in httpOnly cookies |
| Rate Limiting | ✅ | Auth: 10/15min, API: 200/min |
| Helmet Security Headers | ✅ | CSP, HSTS, X-Frame-Options |
| Input Validation | ✅ | Middleware validates all inputs |
| Password Hashing | ✅ | bcryptjs used |
| No LocalStorage for tokens | ✅ | In-memory access token |
| CORS Configuration | ✅ | Strict origin checking |
| Error Handling | ✅ | Generic error messages |
| No Sensitive Data in Logs | ✅ | Fixed - DB config no longer logs URI |

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### Backend (Render)

- [x] Fix MongoDB URI logging (Issue #7) ✅
- [x] Update health check to verify DB (Issue #3) ✅
- [x] Update CSP for Cloudinary uploads (Issue #5) ✅
- [x] Verify REFRESH_TOKEN_EXPIRES_IN in render.yaml ✅
- [ ] Set environment variables in Render dashboard:
  - [ ] `MONGODB_URI` (MongoDB Atlas connection string)
  - [ ] `JWT_SECRET` (generate strong random string)
  - [ ] `REFRESH_TOKEN_SECRET` (different from JWT_SECRET)
  - [ ] `CLIENT_URL` (your Vercel URL)
  - [ ] `CLOUDINARY_CLOUD_NAME`
  - [ ] `CLOUDINARY_API_KEY`
  - [ ] `CLOUDINARY_API_SECRET`
- [ ] Deploy to Render and verify health check passes
- [ ] Note your Render backend URL (e.g., `https://yadhra-closet-api.onrender.com`)

### Frontend (Vercel)

- [ ] Create `frontend/.env.production` with production API URL
- [ ] Or set `VITE_API_URL` in Vercel dashboard
- [ ] Update Vercel environment variables:
  - [ ] `VITE_API_URL` = `https://your-render-app.onrender.com/api`
- [ ] Deploy to Vercel
- [ ] Test authentication flow
- [ ] Test product browsing
- [ ] Test checkout flow
- [ ] Test admin login

---

## 🔗 REQUIRED ENVIRONMENT VARIABLES

### Backend (.env for local, Render Dashboard for production)

```
# Required
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/yadhra?retryWrites=true&w=majority
JWT_SECRET=<strong-random-64-char-string>
REFRESH_TOKEN_SECRET=<different-strong-random-64-char-string>
CLIENT_URL=https://your-vercel-app.vercel.app

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Optional (have defaults)
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
NODE_ENV=production
```

### Frontend

```
VITE_API_URL=https://your-render-app.onrender.com/api
```

---

## 📝 NOTES

1. **Database:** The app uses MongoDB via Mongoose. You'll need a MongoDB Atlas free tier cluster.

2. **Images:** Product images are stored in Cloudinary. The free tier provides 25GB storage/month.

3. **WhatsApp Integration:** Order notifications are sent via WhatsApp (check `lib/whatsapp.ts` for configuration).

4. **Payment:** The checkout appears to use WhatsApp-based ordering - no direct payment integration visible.

---

*End of Report*
