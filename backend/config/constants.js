module.exports = {
  // Moneda por defecto
  DEFAULT_CURRENCY: 'CLP',

  // Tipos de cuenta
  ACCOUNT_TYPES: {
    CHECKING: 'checking',
    SAVINGS: 'savings',
  },

  // Tipos de transacción
  TRANSACTION_TYPES: {
    DEPOSIT: 'deposit',
    WITHDRAWAL: 'withdrawal',
    TRANSFER_IN: 'transfer_in',
    TRANSFER_OUT: 'transfer_out',
  },

  // Estados de transacción
  TRANSACTION_STATUS: {
    COMPLETED: 'completed',
    PENDING: 'pending',
    FAILED: 'failed',
  },

  // Acciones de auditoría
  AUDIT_ACTIONS: {
    LOGIN: 'login',
    LOGOUT: 'logout',
    REGISTER: 'register',
    DEPOSIT: 'deposit',
    WITHDRAWAL: 'withdrawal',
    TRANSFER: 'transfer',
    PASSWORD_CHANGE: 'password_change',
    PROFILE_UPDATE: 'profile_update',
  },

  // Seguridad
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 15,

  // Límites de transacción
  MIN_DEPOSIT: 1000,          // $1.000 CLP mínimo
  MAX_DEPOSIT: 50000000,      // $50.000.000 CLP máximo
  MIN_WITHDRAWAL: 1000,
  MAX_WITHDRAWAL: 10000000,   // $10.000.000 CLP máximo
  MIN_TRANSFER: 1000,
  MAX_TRANSFER: 20000000,     // $20.000.000 CLP máximo

  // Paginación
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};
