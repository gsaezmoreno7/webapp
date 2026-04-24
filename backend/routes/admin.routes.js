const router = require('express').Router();
const {
  getAllAccounts,
  getAllTransactions,
  getSystemStats,
  toggleAccount,
  getAccountDetail,
} = require('../controllers/admin.controller');
const { authenticateAdmin } = require('../middleware/adminAuth.middleware');

/**
 * @swagger
 * tags:
 *   - name: Administrador
 *     description: Panel de control y auditoría del sistema (solo administrador)
 */

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Estadísticas del sistema
 *     description: >
 *       Retorna estadísticas globales de monitoreo: total de cuentas, transacciones,
 *       fondos en el sistema y estado del servidor. **Solo administrador.**
 *     tags: [Administrador]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas del sistema
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 stats:
 *                   type: object
 *                   properties:
 *                     accounts:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         active:
 *                           type: integer
 *                         inactive:
 *                           type: integer
 *                     transactions:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         last_24h:
 *                           type: integer
 *                         by_type:
 *                           type: object
 *                     funds:
 *                       type: object
 *                       properties:
 *                         total_in_system:
 *                           type: number
 *                         currency:
 *                           type: string
 *                     system:
 *                       type: object
 *                       properties:
 *                         uptime_seconds:
 *                           type: number
 *                         environment:
 *                           type: string
 *                         timestamp:
 *                           type: string
 *                           format: date-time
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - Solo administrador
 */
router.get('/stats', authenticateAdmin, getSystemStats);

/**
 * @swagger
 * /api/admin/accounts:
 *   get:
 *     summary: Listar todas las cuentas
 *     description: >
 *       Retorna todas las cuentas bancarias registradas en el sistema con
 *       información del titular. **Solo administrador.**
 *     tags: [Administrador]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cuentas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 total:
 *                   type: integer
 *                 accounts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Account'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - Solo administrador
 */
router.get('/accounts', authenticateAdmin, getAllAccounts);

/**
 * @swagger
 * /api/admin/accounts/{id}:
 *   get:
 *     summary: Detalle de una cuenta
 *     description: Retorna el detalle completo de una cuenta, incluyendo sus últimas 10 transacciones. **Solo administrador.**
 *     tags: [Administrador]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la cuenta
 *     responses:
 *       200:
 *         description: Detalle de la cuenta
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Cuenta no encontrada
 */
router.get('/accounts/:id', authenticateAdmin, getAccountDetail);

/**
 * @swagger
 * /api/admin/accounts/{id}/toggle:
 *   patch:
 *     summary: Activar/Desactivar cuenta
 *     description: Cambia el estado activo de una cuenta bancaria. **Solo administrador.**
 *     tags: [Administrador]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la cuenta a modificar
 *     responses:
 *       200:
 *         description: Estado de cuenta actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 is_active:
 *                   type: boolean
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Cuenta no encontrada
 */
router.patch('/accounts/:id/toggle', authenticateAdmin, toggleAccount);

/**
 * @swagger
 * /api/admin/transactions:
 *   get:
 *     summary: Auditoría global de transacciones
 *     description: >
 *       Lista todas las transacciones del sistema con paginación.
 *       Permite filtrar por tipo. **Solo administrador.**
 *     tags: [Administrador]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Resultados por página (máx. 100)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [deposit, withdrawal, transfer_in, transfer_out]
 *         description: Filtrar por tipo de transacción
 *     responses:
 *       200:
 *         description: Lista de transacciones del sistema
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     total_pages:
 *                       type: integer
 *                 transactions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - Solo administrador
 */
router.get('/transactions', authenticateAdmin, getAllTransactions);

module.exports = router;
