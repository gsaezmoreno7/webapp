const router = require('express').Router();
const { register, login, logout, refreshToken, changePassword } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { loginLimiter } = require('../middleware/rateLimiter.middleware');
const { validate, registerRules, loginRules, changePasswordRules } = require('../middleware/validator.middleware');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     description: Crea un nuevo usuario con su perfil y cuenta bancaria. Se genera automáticamente un número de cuenta único.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, full_name]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@banco.cl
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: "Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 carácter especial"
 *                 example: "MiClave@2024"
 *               full_name:
 *                 type: string
 *                 example: Juan Pérez
 *               rut:
 *                 type: string
 *                 example: "12.345.678-9"
 *               phone:
 *                 type: string
 *                 example: "+56912345678"
 *     responses:
 *       201:
 *         description: Cuenta creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     full_name:
 *                       type: string
 *                 account:
 *                   $ref: '#/components/schemas/Account'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       409:
 *         description: Email ya registrado
 */
router.post('/register', registerRules, validate, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Autentica al usuario y retorna un token JWT. Se bloquea tras 5 intentos fallidos por 15 minutos.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@banco.cl
 *               password:
 *                 type: string
 *                 example: "MiClave@2024"
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 session:
 *                   type: object
 *                   properties:
 *                     access_token:
 *                       type: string
 *                     refresh_token:
 *                       type: string
 *                     expires_in:
 *                       type: integer
 *                     token_type:
 *                       type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *       401:
 *         description: Credenciales inválidas
 *       429:
 *         description: Cuenta bloqueada por intentos fallidos
 */
router.post('/login', loginLimiter, loginRules, validate, login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     description: Cierra la sesión del usuario y registra la acción en auditoría.
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada
 *       401:
 *         description: No autorizado
 */
router.post('/logout', authenticate, logout);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Renovar token
 *     description: Renueva el access token usando un refresh token válido.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refresh_token]
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 description: Refresh token obtenido en el login
 *     responses:
 *       200:
 *         description: Token renovado
 *       401:
 *         description: Refresh token inválido
 */
router.post('/refresh', refreshToken);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Cambiar contraseña
 *     description: Cambia la contraseña del usuario autenticado. La nueva contraseña debe cumplir los requisitos de seguridad.
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [new_password]
 *             properties:
 *               new_password:
 *                 type: string
 *                 minLength: 8
 *                 description: "Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 carácter especial"
 *                 example: "NuevaClave@2024"
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 *       400:
 *         description: Contraseña no cumple requisitos
 *       401:
 *         description: No autorizado
 */
router.post('/change-password', authenticate, changePasswordRules, validate, changePassword);

module.exports = router;
