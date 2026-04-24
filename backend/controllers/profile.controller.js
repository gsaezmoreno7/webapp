const { supabaseAdmin } = require('../config/supabase');
const { asyncHandler, ApiError } = require('../utils/errors');
const { logAudit } = require('../utils/auditLog');
const { AUDIT_ACTIONS } = require('../config/constants');

/**
 * GET /api/profile
 * Obtiene el perfil del usuario autenticado.
 */
const getProfile = asyncHandler(async (req, res) => {
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', req.user.id)
    .single();

  if (error || !profile) {
    throw new ApiError(404, 'Perfil no encontrado');
  }

  res.json({
    profile: {
      id: profile.id,
      email: req.user.email,
      full_name: profile.full_name,
      rut: profile.rut,
      phone: profile.phone,
      address: profile.address,
      date_of_birth: profile.date_of_birth,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    },
  });
});

/**
 * PUT /api/profile
 * Actualiza el perfil del usuario autenticado.
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { full_name, phone, address, date_of_birth } = req.body;
  const ip = req.ip;
  const ua = req.get('User-Agent');

  const updates = {};
  if (full_name !== undefined) updates.full_name = full_name;
  if (phone !== undefined) updates.phone = phone;
  if (address !== undefined) updates.address = address;
  if (date_of_birth !== undefined) updates.date_of_birth = date_of_birth;
  updates.updated_at = new Date().toISOString();

  if (Object.keys(updates).length <= 1) {
    throw new ApiError(400, 'No se proporcionaron datos para actualizar');
  }

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .update(updates)
    .eq('id', req.user.id)
    .select()
    .single();

  if (error) {
    throw new ApiError(500, 'Error al actualizar el perfil');
  }

  await logAudit({
    userId: req.user.id,
    action: AUDIT_ACTIONS.PROFILE_UPDATE,
    ipAddress: ip,
    userAgent: ua,
    details: { fields_updated: Object.keys(updates).filter((k) => k !== 'updated_at') },
    status: 'success',
  });

  res.json({
    message: 'Perfil actualizado exitosamente',
    profile: {
      id: profile.id,
      email: req.user.email,
      full_name: profile.full_name,
      rut: profile.rut,
      phone: profile.phone,
      address: profile.address,
      date_of_birth: profile.date_of_birth,
      updated_at: profile.updated_at,
    },
  });
});

module.exports = { getProfile, updateProfile };
