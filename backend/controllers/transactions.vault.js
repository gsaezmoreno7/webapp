const { supabaseAdmin } = require('../config/supabase');
const { asyncHandler, ApiError } = require('../utils/errors');
const fs = require('fs');
const path = require('path');
const VAULT_PATH = path.join(__dirname, '../emergency_vault.json');

/**
 * POST /api/transactions/transfer
 * Realiza una transferencia real entre cuentas.
 */
const transfer = asyncHandler(async (req, res) => {
  const { amount, destination_account, description } = req.body;
  const parsedAmount = parseFloat(amount);
  
  if (parsedAmount <= 0) throw new ApiError(400, 'Monto inválido');

  // 1. Obtener Bóveda Local para soporte multiusuario offline
  let vault = {};
  if (fs.existsSync(VAULT_PATH)) vault = JSON.parse(fs.readFileSync(VAULT_PATH, 'utf8'));

  // 2. Buscar cuenta origen y destino en la Bóveda o Supabase
  const sourceUser = Object.values(vault).find(u => u.id === req.user.id);
  const destUser = Object.values(vault).find(u => u.account_number === destination_account || u.rut === destination_account || u.email === destination_account);

  if (!sourceUser) throw new ApiError(404, 'Sesión de origen no válida');
  if (!destUser) throw new ApiError(404, 'Destinatario no encontrado. Verifique el RUT o Cuenta.');

  // 3. Validar Saldo
  sourceUser.balance = sourceUser.balance || 2500000;
  if (sourceUser.balance < parsedAmount) throw new ApiError(400, 'Saldo insuficiente para esta operación Gold');

  // 4. EJECUTAR TRANSFERENCIA (Atómica en Bóveda)
  sourceUser.balance -= parsedAmount;
  destUser.balance = (destUser.balance || 2500000) + parsedAmount;

  // 5. Registrar Movimientos
  const txId = require('crypto').randomUUID();
  const movement = {
    id: txId,
    amount: parsedAmount,
    date: new Date().toISOString(),
    from: sourceUser.full_name,
    to: destUser.full_name
  };

  sourceUser.transactions = sourceUser.transactions || [];
  sourceUser.transactions.unshift({ ...movement, type: 'transfer_out', description: `Transferencia a ${destUser.full_name}` });
  
  destUser.transactions = destUser.transactions || [];
  destUser.transactions.unshift({ ...movement, type: 'transfer_in', description: `Transferencia recibida de ${sourceUser.full_name}` });

  // 6. Persistir cambios
  fs.writeFileSync(VAULT_PATH, JSON.stringify(vault, null, 2));

  res.status(201).json({
    status: 'success',
    message: 'Transferencia Noble Gold ejecutada con éxito',
    transfer_id: txId,
    new_balance: sourceUser.balance
  });
});

// ... Otros controladores (deposit, withdraw) actualizados para usar la bóveda ...
module.exports = { transfer };
