const { supabase, supabaseAdmin } = require('../config/supabase');
const { ApiError } = require('../utils/errors');

/**
 * Middleware de autenticación para Administrador.
 * Verifica JWT + que el email sea del admin configurado en .env
 */
async function authenticateAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Token de autenticación requerido');
    }

    const token = authHeader.split(' ')[1];

    // Verificar el token con Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new ApiError(401, 'Token inválido o expirado');
    }

    // Verificar si el usuario es administrador
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      throw new ApiError(500, 'Configuración de administrador no definida');
    }

    if (user.email !== adminEmail) {
      throw new ApiError(403, 'Acceso denegado: se requieren privilegios de administrador');
    }

    req.user = user;
    req.accessToken = token;
    req.isAdmin = true;

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(401).json({ error: 'No autorizado' });
  }
}

module.exports = { authenticateAdmin };
