const { supabase, supabaseAdmin } = require('../config/supabase');
const { asyncHandler, ApiError } = require('../utils/errors');

/**
 * POST /api/auth/register
 * Registro profesional con Supabase Auth y Tablas Relacionales
 */
const register = asyncHandler(async (req, res) => {
  const { email, password, full_name, rut } = req.body;

  // 1. Registro en Supabase Auth (Cifrado de cuenta)
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw new ApiError(400, `Error de Autenticación: ${authError.message}`);

  const userId = authData.user.id;

  // 2. Crear Perfil en tabla 'profiles'
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert([{ id: userId, full_name, rut }]);

  if (profileError) {
    // Si falla el perfil, intentamos limpiar el auth para no dejar cuentas huérfanas
    await supabaseAdmin.auth.admin.deleteUser(userId);
    throw new ApiError(400, `Error al crear perfil: ${profileError.message}`);
  }

  // 3. Crear Cuenta Bancaria con Saldo Inicial ($2.5M)
  const accNum = 'GB-' + Math.floor(1000 + Math.random() * 9000) + '-GOLD';
  const { data: account, error: accountError } = await supabaseAdmin
    .from('accounts')
    .insert([{ 
        user_id: userId, 
        account_number: accNum, 
        balance: 2500000, 
        currency: 'CLP',
        card_status: 'active'
    }])
    .select()
    .single();

  if (accountError) throw new ApiError(400, `Error al crear cuenta: ${accountError.message}`);

  // 4. Registrar Transacción de Apertura
  await supabaseAdmin
    .from('transactions')
    .insert([{
        account_id: account.id,
        type: 'deposit',
        amount: 2500000,
        description: 'Bono de Apertura Noble Gold'
    }]);

  res.status(201).json({
    status: 'success',
    message: 'Cuenta Noble Gold activada en la nube.',
    user: { id: userId, email, full_name, account_number: accNum },
    session: authData.session
  });
});

/**
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) throw new ApiError(401, 'Credenciales Gold denegadas.');

  // Obtener datos extendidos del usuario
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  const { data: account } = await supabaseAdmin
    .from('accounts')
    .select('account_number')
    .eq('user_id', data.user.id)
    .single();

  res.json({
    status: 'success',
    user: {
      id: data.user.id,
      email: data.user.email,
      full_name: profile ? profile.full_name : 'Usuario Noble',
      account_number: account ? account.account_number : 'GB-PEND-GOLD'
    },
    session: data.session
  });
});

/**
 * POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  await supabase.auth.signOut();
  res.json({ status: 'success', message: 'Sesión Noble Gold cerrada con seguridad' });
});

/**
 * POST /api/auth/refresh
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refresh_token } = req.body;
  const { data, error } = await supabase.auth.refreshSession({ refresh_token });
  if (error) throw new ApiError(401, 'Sesión de renovación expirada');
  res.json({ status: 'success', session: data.session });
});

/**
 * POST /api/auth/change-password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { new_password } = req.body;
  const { error } = await supabase.auth.updateUser({ password: new_password });
  if (error) throw new ApiError(400, 'Error al actualizar clave maestra');
  res.json({ status: 'success', message: 'Clave maestra actualizada' });
});

module.exports = { register, login, logout, refreshToken, changePassword };
