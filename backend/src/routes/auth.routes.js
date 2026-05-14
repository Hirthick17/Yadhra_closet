// src/routes/auth.routes.js
const router = require('express').Router();
const { register, login, refresh, logout, me } = require('../controller/auth.controller');
const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validate');

// Validation middleware runs first — rejects malformed requests before any DB touch
router.post('/register', validateRegister, register); // POST /api/auth/register
router.post('/login',    validateLogin,    login);    // POST /api/auth/login
router.post('/refresh',  refresh);                    // POST /api/auth/refresh (reads httpOnly cookie)
router.post('/logout',   protect, logout);            // POST /api/auth/logout
router.get('/me',        protect, me);                // GET  /api/auth/me

module.exports = router;
