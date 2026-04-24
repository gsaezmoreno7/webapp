const router = require('express').Router();
const { getProfile, updateProfile } = require('../controllers/profile.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate, profileUpdateRules } = require('../middleware/validator.middleware');

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Obtener perfil
 *     description: Retorna el perfil completo del usuario autenticado, incluyendo nombre, RUT, teléfono, dirección y fecha de nacimiento.
 *     tags: [Perfil]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile:
 *                   $ref: '#/components/schemas/Profile'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Perfil no encontrado
 */
router.get('/', authenticate, getProfile);

/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Actualizar perfil
 *     description: Actualiza los datos del perfil del usuario. Solo se modifican los campos proporcionados.
 *     tags: [Perfil]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: "Juan Andrés Pérez"
 *               phone:
 *                 type: string
 *                 example: "+56987654321"
 *               address:
 *                 type: string
 *                 example: "Av. Providencia 1234, Santiago"
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 example: "1990-05-15"
 *     responses:
 *       200:
 *         description: Perfil actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 profile:
 *                   $ref: '#/components/schemas/Profile'
 *       400:
 *         description: Datos inválidos o sin cambios
 *       401:
 *         description: No autorizado
 */
router.put('/', authenticate, profileUpdateRules, validate, updateProfile);

module.exports = router;
