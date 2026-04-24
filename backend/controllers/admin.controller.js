const { supabaseAdmin } = require('../config/supabase');
const { asyncHandler, ApiError } = require('../utils/errors');

/**
 * GET /api/admin/accounts
 * Lista todas las cuentas registradas del sistema
 */
const getAllAccounts = asyncHandler(async (req, res) => {
  const { data: accounts, error } = await supabaseAdmin
    .from('accounts')
    .select(`
      id,
      account_number,
      balance,
      currency,
      card_status,
      is_active,
      created_at,
      profiles (
        full_name,
        rut
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw new ApiError(500, `Error al obtener cuentas: ${error.message}`);

  res.json({
    status: 'success',
    total: accounts.length,
    accounts: accounts || [],
  });
});

/**
 * GET /api/admin/transactions
 * Auditoría global de todas las transacciones del sistema
 */
const getAllTransactions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, type } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = supabaseAdmin
    .from('transactions')
    .select(`
      id,
      type,
      amount,
      description,
      destination_account,
      created_at,
      accounts (
        account_number,
        profiles (
          full_name,
          rut
        )
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + parseInt(limit) - 1);

  if (type) {
    query = query.eq('type', type);
  }

  const { data: transactions, error, count } = await query;

  if (error) throw new ApiError(500, `Error en auditoría: ${error.message}`);

  res.json({
    status: 'success',
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      total_pages: Math.ceil(count / parseInt(limit)),
    },
    transactions: transactions || [],
  });
});

/**
 * GET /api/admin/stats
 * Estadísticas generales del sistema para monitoreo
 */
const getSystemStats = asyncHandler(async (req, res) => {
  // Total cuentas
  const { count: totalAccounts } = await supabaseAdmin
    .from('accounts')
    .select('*', { count: 'exact', head: true });

  // Cuentas activas
  const { count: activeAccounts } = await supabaseAdmin
    .from('accounts')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  // Total transacciones
  const { count: totalTransactions } = await supabaseAdmin
    .from('transactions')
    .select('*', { count: 'exact', head: true });

  // Transacciones últimas 24h
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: recentTransactions } = await supabaseAdmin
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', yesterday);

  // Suma total de fondos en el sistema
  const { data: balanceData } = await supabaseAdmin
    .from('accounts')
    .select('balance')
    .eq('is_active', true);

  const totalFunds = balanceData
    ? balanceData.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0)
    : 0;

  // Transacciones por tipo
  const { data: byType } = await supabaseAdmin
    .from('transactions')
    .select('type');

  const typeCounts = (byType || []).reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + 1;
    return acc;
  }, {});

  res.json({
    status: 'success',
    stats: {
      accounts: {
        total: totalAccounts || 0,
        active: activeAccounts || 0,
        inactive: (totalAccounts || 0) - (activeAccounts || 0),
      },
      transactions: {
        total: totalTransactions || 0,
        last_24h: recentTransactions || 0,
        by_type: typeCounts,
      },
      funds: {
        total_in_system: totalFunds,
        currency: 'CLP',
      },
      system: {
        uptime_seconds: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
      },
    },
  });
});

/**
 * PATCH /api/admin/accounts/:id/toggle
 * Activa o desactiva una cuenta
 */
const toggleAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: account, error: findError } = await supabaseAdmin
    .from('accounts')
    .select('id, is_active, account_number')
    .eq('id', id)
    .single();

  if (findError || !account) throw new ApiError(404, 'Cuenta no encontrada');

  const newStatus = !account.is_active;
  const { error: updateError } = await supabaseAdmin
    .from('accounts')
    .update({ is_active: newStatus })
    .eq('id', id);

  if (updateError) throw new ApiError(500, `Error al actualizar cuenta: ${updateError.message}`);

  res.json({
    status: 'success',
    message: `Cuenta ${account.account_number} ${newStatus ? 'activada' : 'desactivada'} por administrador`,
    is_active: newStatus,
  });
});

/**
 * GET /api/admin/accounts/:id
 * Detalle completo de una cuenta (admin)
 */
const getAccountDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: account, error } = await supabaseAdmin
    .from('accounts')
    .select(`
      *,
      profiles (full_name, rut, created_at)
    `)
    .eq('id', id)
    .single();

  if (error || !account) throw new ApiError(404, 'Cuenta no encontrada');

  // Obtener últimas transacciones de esta cuenta
  const { data: transactions } = await supabaseAdmin
    .from('transactions')
    .select('*')
    .eq('account_id', id)
    .order('created_at', { ascending: false })
    .limit(10);

  res.json({
    status: 'success',
    account,
    recent_transactions: transactions || [],
  });
});

module.exports = { getAllAccounts, getAllTransactions, getSystemStats, toggleAccount, getAccountDetail };
