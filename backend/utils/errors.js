/**
 * Error personalizado para la API.
 * Extiende Error con un statusCode HTTP.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

/**
 * Wrapper para capturar errores async en controladores.
 * Evita tener try/catch en cada controlador.
 * @param {Function} fn - Función async del controlador
 * @returns {Function}
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { ApiError, asyncHandler };
