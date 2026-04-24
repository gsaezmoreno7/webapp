-- =============================================
-- 🏦 NOBLE GOLD PORTAL — Esquema de Seguridad Final
-- =============================================

-- 1. TABLA profiles (Información Personal)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  rut TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA accounts (Banca y Tarjeta)
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  account_number TEXT UNIQUE NOT NULL,
  balance NUMERIC(15, 2) DEFAULT 2500000 CHECK (balance >= 0),
  currency TEXT DEFAULT 'CLP',
  card_status TEXT DEFAULT 'active' CHECK (card_status IN ('active', 'blocked', 'requested')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA transactions (Movimientos entre Usuarios)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  description TEXT,
  destination_account TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Habilitar RLS (Seguridad por Fila)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de Acceso (Solo dueño puede ver sus datos)
CREATE POLICY "Acceso personal perfiles" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Acceso personal cuentas" ON accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Acceso personal transacciones" ON transactions FOR SELECT USING (
  account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid())
);
