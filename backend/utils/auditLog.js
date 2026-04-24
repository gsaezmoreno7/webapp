const { supabaseAdmin } = require('../config/supabase');

/**
 * Registra un evento en la tabla audit_logs.
 * @param {object} params
 * @param {string} params.userId - ID del usuario
 * @param {string} params.action - Acción realizada
 * @param {string} params.ipAddress - IP del cliente
 * @param {string} params.userAgent - User-agent del navegador
 * @param {object} params.details - Detalles adicionales (JSON)
 * @param {string} params.status - 'success' o 'failure'
 */
async function logAudit({ userId, action, ipAddress, userAgent, details = {}, status = 'success' }) {
  try {
    await supabaseAdmin.from('audit_logs').insert({
      user_id: userId || null,
      action,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      details,
      status,
    });
  } catch (error) {
    // No lanzar error para que la auditoría no interrumpa el flujo principal
    console.error('[AUDIT LOG ERROR]', error.message);
  }
}

module.exports = { logAudit };
