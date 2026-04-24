const { supabaseAdmin } = require('../config/supabase');
const { asyncHandler, ApiError } = require('../utils/errors');

/**
 * POST /api/transactions/transfer
 * Ejecuta una transferencia real en la base de datos de Supabase
 */
const transfer = asyncHandler(async (req, res) => {
  const { amount, destination_account, description } = req.body;
  const parsedAmount = parseFloat(amount);

  if (parsedAmount <= 0) throw new ApiError(400, 'El monto debe ser superior a 0');

  // 1. Obtener la cuenta de origen
  const { data: sourceAcc, errorAddress } = await supabaseAdmin
    .from('accounts')
    .select('id, balance, account_number')
    .eq('user_id', req.user.id)
    .single();

  if (!sourceAcc) throw new ApiError(404, 'Cuenta de origen no encontrada');
  if (sourceAcc.balance < parsedAmount) throw new ApiError(400, 'Saldo insuficiente para esta transferencia Gold');

  // 2. Buscar la cuenta de destino (por número de cuenta o RUT)
  const { data: destAcc, errorDest } = await supabaseAdmin
    .from('accounts')
    .select('id, balance, account_number, profiles(full_name)')
    .or(`account_number.eq.${destination_account}`)
    .single();

  if (!destAcc) throw new ApiError(404, 'Destinatario no encontrado en la red Gold');
  if (sourceAcc.id === destAcc.id) throw new ApiError(400, 'No se permite transferencia a la misma cuenta');

  // 3. Ejecutar la transferencia (Actualización de saldos)
  const newSourceBalance = sourceAcc.balance - parsedAmount;
  const newDestBalance = parseFloat(destAcc.balance) + parsedAmount;

  await supabaseAdmin.from('accounts').update({ balance: newSourceBalance }).eq('id', sourceAcc.id);
  await supabaseAdmin.from('accounts').update({ balance: newDestBalance }).eq('id', destAcc.id);

  // 4. Registrar transacciones para el historial
  await supabaseAdmin.from('transactions').insert([
    { account_id: sourceAcc.id, type: 'transfer_out', amount: parsedAmount, description: `Envío a ${destAcc.profiles.full_name}`, destination_account: destAcc.account_number },
    { account_id: destAcc.id, type: 'transfer_in', amount: parsedAmount, description: `Recibido de ${req.user.email}`, destination_account: sourceAcc.account_number }
  ]);

  res.json({
    status: 'success',
    message: 'Transferencia Noble Gold exitosa',
    new_balance: newSourceBalance
  });
});

/**
 * GET /api/transactions
 */
const getHistory = asyncHandler(async (req, res) => {
  const { data: account } = await supabaseAdmin.from('accounts').select('id').eq('user_id', req.user.id).single();
  
  if (!account) throw new ApiError(404, 'Cuenta no encontrada');

  const { data: transactions, error } = await supabaseAdmin
    .from('transactions')
    .select('*')
    .eq('account_id', account.id)
    .order('created_at', { ascending: false });

  res.json({
    transactions: transactions || []
  });
});

/**
 * POST /api/transactions/deposit
 */
const deposit = asyncHandler(async (req, res) => {
  const { amount, description } = req.body;
  const parsedAmount = parseFloat(amount);

  const { data: account } = await supabaseAdmin.from('accounts').select('id, balance').eq('user_id', req.user.id).single();
  const newBalance = account.balance + parsedAmount;

  await supabaseAdmin.from('accounts').update({ balance: newBalance }).eq('id', account.id);
  await supabaseAdmin.from('transactions').insert([{ 
    account_id: account.id, 
    type: 'deposit', 
    amount: parsedAmount, 
    description: description || 'Depósito en cuenta' 
  }]);

  res.json({ status: 'success', new_balance: newBalance });
});

/**
 * POST /api/transactions/withdraw
 */
const withdraw = asyncHandler(async (req, res) => {
  const { amount, description } = req.body;
  const parsedAmount = parseFloat(amount);

  const { data: account } = await supabaseAdmin.from('accounts').select('id, balance').eq('user_id', req.user.id).single();
  if (account.balance < parsedAmount) throw new ApiError(400, 'Saldo insuficiente');

  const newBalance = account.balance - parsedAmount;
  await supabaseAdmin.from('accounts').update({ balance: newBalance }).eq('id', account.id);
  await supabaseAdmin.from('transactions').insert([{ 
    account_id: account.id, 
    type: 'withdrawal', 
    amount: parsedAmount, 
    description: description || 'Giro en cajero gold' 
  }]);

  res.json({ status: 'success', new_balance: newBalance });
});

/**
 * GET /api/transactions/:id
 */
const getTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { data: transaction, error } = await supabaseAdmin
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !transaction) throw new ApiError(404, 'Movimiento no encontrado');
  res.json({ transaction });
});

module.exports = { transfer, getHistory, deposit, withdraw, getTransaction };
