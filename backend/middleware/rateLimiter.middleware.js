const rateLimit = require('express-rate-limit');

/**
 * Rate limiter general: 100 requests por ventana de 15 minutos.
 */
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter para login: 5 intentos por ventana de 15 minutos.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.LOGIN_RATE_LIMIT_MAX) || 5,
  message: {
    error: 'Demasiados intentos de inicio de sesión. Intenta en 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

/**
 * Rate limiter para transacciones: 30 por ventana de 15 minutos.
 */
const transactionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    error: 'Demasiadas transacciones. Intenta de nuevo más tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { generalLimiter, loginLimiter, transactionLimiter };
