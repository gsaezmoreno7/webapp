const router = require('express').Router();
const { getAccount, getBalance, updateCardStatus } = require('../controllers/account.controller');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/account:
 *   get:
 *     summary: Obtener información de la cuenta
 *     description: Retorna la información completa de la cuenta bancaria del usuario autenticado, incluyendo saldo, tipo de cuenta y número de cuenta.
 *     tags: [Cuenta]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información de la cuenta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 account:
 *                   $ref: '#/components/schemas/Account'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Cuenta no encontrada
 */
router.get('/', authenticate, getAccount);

/**
 * @swagger
 * /api/account/balance:
 *   get:
 *     summary: Obtener saldo
 *     description: Retorna únicamente el saldo actual, número de cuenta y moneda.
 *     tags: [Cuenta]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Saldo de la cuenta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 account_number:
 *                   type: string
 *                   example: "1234-5678-9012"
 *                 balance:
 *                   type: number
 *                   example: 1500000
 *                 currency:
 *                   type: string
 *                   example: CLP
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Cuenta no encontrada
 */
router.get('/balance', authenticate, getBalance);

router.post('/card/block', authenticate, updateCardStatus('blocked'));
router.post('/card/unblock', authenticate, updateCardStatus('active'));
router.post('/card/request', authenticate, updateCardStatus('requested'));

module.exports = router;
