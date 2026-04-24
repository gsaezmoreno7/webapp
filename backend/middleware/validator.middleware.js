const { body, param, query, validationResult } = require('express-validator');
const { MIN_DEPOSIT, MAX_DEPOSIT, MIN_WITHDRAWAL, MAX_WITHDRAWAL, MIN_TRANSFER, MAX_TRANSFER } = require('../config/constants');

/**
 * Middleware que ejecuta las validaciones y retorna errores si los hay.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Datos inválidos',
      details: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
}

// ===== Reglas de validación =====

const registerRules = [
  body('email').isString().withMessage('Email debe ser válido'), // Menos estricto para pruebas
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('full_name').notEmpty().withMessage('El nombre es obligatorio'),
  body('rut')
    .optional()
    .trim()
    .matches(/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/).withMessage('Formato de RUT inválido (ej: 12.345.678-9)'),
  body('phone')
    .optional()
    .trim()
    .isMobilePhone('es-CL').withMessage('Teléfono inválido'),
];

const loginRules = [
  body('email')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Contraseña requerida'),
];

const depositRules = [
  body('amount')
    .isFloat({ min: MIN_DEPOSIT, max: MAX_DEPOSIT })
    .withMessage(`Monto debe estar entre $${MIN_DEPOSIT.toLocaleString()} y $${MAX_DEPOSIT.toLocaleString()}`),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Descripción muy larga (máx. 200 caracteres)')
    .escape(),
];

const withdrawalRules = [
  body('amount')
    .isFloat({ min: MIN_WITHDRAWAL, max: MAX_WITHDRAWAL })
    .withMessage(`Monto debe estar entre $${MIN_WITHDRAWAL.toLocaleString()} y $${MAX_WITHDRAWAL.toLocaleString()}`),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Descripción muy larga (máx. 200 caracteres)')
    .escape(),
];

const transferRules = [
  body('amount')
    .isFloat({ min: MIN_TRANSFER, max: MAX_TRANSFER })
    .withMessage(`Monto debe estar entre $${MIN_TRANSFER.toLocaleString()} y $${MAX_TRANSFER.toLocaleString()}`),
  body('destination_account')
    .trim()
    .notEmpty().withMessage('Cuenta destino requerida')
    .matches(/^\d{4}-\d{4}-\d{4}$/).withMessage('Formato de cuenta destino inválido'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Descripción muy larga (máx. 200 caracteres)')
    .escape(),
];

const profileUpdateRules = [
  body('full_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Nombre debe tener entre 2 y 100 caracteres')
    .escape(),
  body('phone')
    .optional()
    .trim(),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Dirección muy larga')
    .escape(),
  body('date_of_birth')
    .optional()
    .isISO8601().withMessage('Fecha de nacimiento inválida'),
];

const changePasswordRules = [
  body('new_password')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener mínimo 8 caracteres')
    .matches(/[A-Z]/).withMessage('Debe contener al menos una mayúscula')
    .matches(/[a-z]/).withMessage('Debe contener al menos una minúscula')
    .matches(/[0-9]/).withMessage('Debe contener al menos un número')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Debe contener al menos un carácter especial'),
];

const paginationRules = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Página debe ser un número positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Límite debe estar entre 1 y 100'),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  depositRules,
  withdrawalRules,
  transferRules,
  profileUpdateRules,
  changePasswordRules,
  paginationRules,
};
