const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '🏦 Banco en Línea API',
      version: '1.0.0',
      description: `
API REST para un sistema de banco en línea.

## Funcionalidades
- 🔐 Registro e inicio de sesión seguros
- 💰 Depósitos, retiros y transferencias
- 📊 Historial de transacciones
- 👤 Gestión de perfil de usuario

## Autenticación
Todos los endpoints protegidos requieren un token JWT en el header:
\`Authorization: Bearer <token>\`

## Seguridad
- Rate limiting en todos los endpoints
- Validación estricta de inputs
- Auditoría de operaciones sensibles
- Bloqueo anti-bruteforce
      `,
      contact: {
        name: 'Soporte',
        email: 'soporte@banco.cl',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Servidor de desarrollo (local)',
      },
      {
        url: 'https://banco-api.vercel.app',
        description: 'Servidor de producción (HTTPS/Vercel)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingresa tu token JWT obtenido del login',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', description: 'Mensaje de error' },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Datos inválidos' },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        Profile: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            full_name: { type: 'string', example: 'Juan Pérez' },
            rut: { type: 'string', example: '12.345.678-9' },
            phone: { type: 'string', example: '+56912345678' },
            address: { type: 'string' },
            date_of_birth: { type: 'string', format: 'date' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Account: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            account_number: { type: 'string', example: '1234-5678-9012' },
            account_type: { type: 'string', enum: ['checking', 'savings'] },
            balance: { type: 'number', example: 1500000 },
            currency: { type: 'string', example: 'CLP' },
            is_active: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            account_id: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: ['deposit', 'withdrawal', 'transfer_in', 'transfer_out'] },
            amount: { type: 'number', example: 50000 },
            balance_after: { type: 'number', example: 1550000 },
            description: { type: 'string' },
            destination_account: { type: 'string', nullable: true },
            status: { type: 'string', enum: ['completed', 'pending', 'failed'] },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    tags: [
      { name: 'Autenticación', description: 'Registro, login, logout y gestión de sesión' },
      { name: 'Cuenta', description: 'Información y saldo de la cuenta bancaria' },
      { name: 'Transacciones', description: 'Depósitos, retiros, transferencias e historial' },
      { name: 'Perfil', description: 'Gestión del perfil del usuario' },
      { name: 'Administrador', description: 'Panel de control: gestión de cuentas, auditoría global y monitoreo del sistema (solo admin)' },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
