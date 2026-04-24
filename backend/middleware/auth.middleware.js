const { supabase } = require('../config/supabase');
const { ApiError } = require('../utils/errors');

/**
 * Middleware de autenticación.
 * Verifica el JWT del header Authorization y adjunta el usuario a req.user.
 */
async function authenticate(req, res, next) {
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

    // Adjuntar usuario y token al request
    req.user = user;
    req.accessToken = token;

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(401).json({ error: 'No autorizado' });
  }
}

module.exports = { authenticate };
