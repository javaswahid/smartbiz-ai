import rateLimit from 'express-rate-limit';

// Standard rate limiter: max 100 requests per 15 minutes per IP
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Terlalu banyak permintaan dari IP ini, silakan coba lagi setelah 15 menit.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for authentication routes: max 10 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Terlalu banyak upaya login dari IP ini. Silakan coba lagi setelah 15 menit.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
