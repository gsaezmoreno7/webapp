const { supabaseAdmin } = require('../config/supabase');
const { asyncHandler, ApiError } = require('../utils/errors');

/**
 * GET /api/account
 * Obtiene la información real de la cuenta desde Supabase.
 */
const getAccount = asyncHandler(async (req, res) => {
  const { data: account, error } = await supabaseAdmin
    .from('accounts')
    .select(`
      *,
      profiles (
        full_name,
        rut
      )
    `)
    .eq('user_id', req.user.id)
    .single();

  if (error || !account) {
    throw new ApiError(404, 'Cuenta no encontrada en la red Gold');
  }

  res.json({
    account: {
      id: account.id,
      account_number: account.account_number,
      balance: parseFloat(account.balance),
      currency: account.currency,
      card_status: account.card_status || 'active',
      full_name: account.profiles.full_name,
      rut: account.profiles.rut
    }
  });
});

/**
 * Actualiza el estado de la tarjeta en la nube
 */
const updateCardStatus = (status) => asyncHandler(async (req, res) => {
  const { error } = await supabaseAdmin
    .from('accounts')
    .update({ card_status: status })
    .eq('user_id', req.user.id);

  if (error) throw new ApiError(500, 'Error al actualizar estado de tarjeta');

  res.json({
    status: 'success',
    new_status: status
  });
});

/**
 * GET /api/account/balance
 */
const getBalance = asyncHandler(async (req, res) => {
  const { data: account, error } = await supabaseAdmin
    .from('accounts')
    .select('balance, currency, account_number')
    .eq('user_id', req.user.id)
    .single();

  if (error) throw new ApiError(404, 'Cuenta no encontrada');

  res.json({
    account_number: account.account_number,
    balance: parseFloat(account.balance),
    currency: account.currency,
  });
});

module.exports = { getAccount, getBalance, updateCardStatus };
