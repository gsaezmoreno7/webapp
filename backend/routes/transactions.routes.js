const router = require('express').Router();
const { deposit, withdraw, transfer, getHistory, getTransaction } = require('../controllers/transactions.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { transactionLimiter } = require('../middleware/rateLimiter.middleware');
const { validate, depositRules, withdrawalRules, transferRules, paginationRules } = require('../middleware/validator.middleware');

/**
 * @swagger
 * /api/transactions/deposit:
 *   post:
 *     summary: Realizar un depósito
 *     description: Deposita dinero en la cuenta del usuario autenticado. Monto mínimo $1.000, máximo $50.000.000 CLP.
 *     tags: [Transacciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 1000
 *                 maximum: 50000000
 *                 example: 500000
 *                 description: Monto a depositar en CLP
 *               description:
 *                 type: string
 *                 example: "Depósito de sueldo"
 *                 description: Descripción opcional del depósito
 *     responses:
 *       201:
 *         description: Depósito realizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 transaction:
 *                   $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       429:
 *         description: Demasiadas transacciones
 */
router.post('/deposit', authenticate, transactionLimiter, depositRules, validate, deposit);

/**
 * @swagger
 * /api/transactions/withdraw:
 *   post:
 *     summary: Realizar un retiro
 *     description: Retira dinero de la cuenta del usuario. Valida que el saldo sea suficiente. Monto mínimo $1.000, máximo $10.000.000 CLP.
 *     tags: [Transacciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 1000
 *                 maximum: 10000000
 *                 example: 50000
 *                 description: Monto a retirar en CLP
 *               description:
 *                 type: string
 *                 example: "Retiro cajero automático"
 *     responses:
 *       201:
 *         description: Retiro realizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 transaction:
 *                   $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Saldo insuficiente o datos inválidos
 *       401:
 *         description: No autorizado
 */
router.post('/withdraw', authenticate, transactionLimiter, withdrawalRules, validate, withdraw);

/**
 * @swagger
 * /api/transactions/transfer:
 *   post:
 *     summary: Transferir a otra cuenta
 *     description: Transfiere dinero a otra cuenta del banco. Valida saldo suficiente y cuenta destino existente. Monto mínimo $1.000, máximo $20.000.000 CLP.
 *     tags: [Transacciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, destination_account]
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 1000
 *                 maximum: 20000000
 *                 example: 100000
 *                 description: Monto a transferir en CLP
 *               destination_account:
 *                 type: string
 *                 example: "5678-1234-9012"
 *                 description: Número de cuenta destino (formato XXXX-XXXX-XXXX)
 *               description:
 *                 type: string
 *                 example: "Pago arriendo"
 *     responses:
 *       201:
 *         description: Transferencia realizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 transaction:
 *                   $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Saldo insuficiente, cuenta propia, o datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Cuenta destino no encontrada
 */
router.post('/transfer', authenticate, transactionLimiter, transferRules, validate, transfer);

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Historial de transacciones
 *     description: Obtiene el historial de transacciones de la cuenta con paginación. Se puede filtrar por tipo de transacción.
 *     tags: [Transacciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Cantidad de resultados por página
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [deposit, withdrawal, transfer_in, transfer_out]
 *         description: Filtrar por tipo de transacción
 *     responses:
 *       200:
 *         description: Historial de transacciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
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
 *       401:
 *         description: No autorizado
 */
router.get('/', authenticate, paginationRules, validate, getHistory);

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Detalle de transacción
 *     description: Obtiene el detalle completo de una transacción específica, incluyendo referencia cruzada para transferencias.
 *     tags: [Transacciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la transacción
 *     responses:
 *       200:
 *         description: Detalle de la transacción
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transaction:
 *                   $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Transacción no encontrada
 */
router.get('/:id', authenticate, getTransaction);

module.exports = router;
