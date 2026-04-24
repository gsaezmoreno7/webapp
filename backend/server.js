require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swagger');
const { generalLimiter } = require('./middleware/rateLimiter.middleware');

// Routes
const authRoutes = require('./routes/auth.routes');
const accountRoutes = require('./routes/account.routes');
const transactionsRoutes = require('./routes/transactions.routes');
const profileRoutes = require('./routes/profile.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== SEGURIDAD =====

// Helmet: headers de seguridad HTTP
app.use(helmet({
  contentSecurityPolicy: false, // Desactivar para Swagger UI
  crossOriginEmbedderPolicy: false,
}));

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Rate limiting general
// app.use(generalLimiter); // Desactivado para fluidez Gold

// ===== MIDDLEWARE =====

// Body parser
app.use(express.json({ limit: '10kb' })); // Limitar tamaño del body
app.use(express.urlencoded({ extended: true }));

// Logger HTTP
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Trust proxy (para obtener IP real detrás de proxies)
app.set('trust proxy', 1);

// ===== SWAGGER UI =====
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info .title { color: #1a3a8f; }
  `,
  customSiteTitle: '🏦 Banco en Línea - API Docs',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
  },
}));

// ===== RUTAS =====
app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    name: '🏦 Banco en Línea API',
    version: '1.0.0',
    docs: `http://localhost:${PORT}/api-docs`,
    status: 'online',
    endpoints: {
      auth: '/api/auth',
      account: '/api/account',
      transactions: '/api/transactions',
      profile: '/api/profile',
    },
  });
});

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ===== MANEJO DE ERRORES =====

// 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl,
  });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);

  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : 'Error interno del servidor';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ===== INICIAR SERVIDOR =====
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║         🏦  BANCO EN LÍNEA - API SERVER         ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  🚀 Servidor:    http://localhost:${PORT}            ║`);
  console.log(`║  📚 Swagger UI:  http://localhost:${PORT}/api-docs   ║`);
  console.log(`║  🔧 Entorno:     ${(process.env.NODE_ENV || 'development').padEnd(27)}  ║`);
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
});

module.exports = app;
