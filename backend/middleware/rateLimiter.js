const rateLimit = require('express-rate-limit');

// Strict limit for AI design generation (expensive calls)
const designLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: 'Too many requests, please wait a few minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth routes (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: { error: 'Too many auth attempts, try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { designLimiter, apiLimiter, authLimiter };
