const { createClient } = require('@supabase/supabase-js');

// Cliente público (con anon key) - respeta Row Level Security
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Cliente admin (con service role key) - ignora RLS, para operaciones del servidor
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Crea un cliente Supabase autenticado con el token JWT del usuario.
 * Esto asegura que las consultas respeten las RLS policies.
 * @param {string} accessToken - JWT token del usuario
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
function getSupabaseClient(accessToken) {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );
}

module.exports = { supabase, supabaseAdmin, getSupabaseClient };
