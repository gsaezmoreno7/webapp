-- =============================================
-- 🏦 BANCO EN LÍNEA — Script SQL para Supabase
-- =============================================
-- Ejecutar este script en el SQL Editor de Supabase
-- https://app.supabase.com → SQL Editor → New Query

-- ===== 1. TABLA profiles =====
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  rut TEXT UNIQUE,
  phone TEXT,
  address TEXT,
  date_of_birth DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== 2. TABLA accounts =====
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  account_number TEXT UNIQUE NOT NULL,
  account_type TEXT DEFAULT 'checking' CHECK (account_type IN ('checking', 'savings')),
  balance NUMERIC(15, 2) DEFAULT 0 CHECK (balance >= 0),
  currency TEXT DEFAULT 'CLP',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsquedas rápidas por user_id
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_account_number ON accounts(account_number);

-- ===== 3. TABLA transactions =====
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'transfer_in', 'transfer_out')),
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  balance_after NUMERIC(15, 2),
  description TEXT,
  reference_id UUID REFERENCES transactions(id),
  destination_account TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- ===== 4. TABLA audit_logs =====
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  details JSONB DEFAULT '{}',
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failure')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ===== 5. TABLA login_attempts =====
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address TEXT,
  success BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_created_at ON login_attempts(created_at DESC);

-- ===== 6. ROW LEVEL SECURITY (RLS) =====

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles: usuarios solo ven su propio perfil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Políticas para accounts: usuarios solo ven su propia cuenta
CREATE POLICY "Users can view own accounts"
  ON accounts FOR SELECT
  USING (auth.uid() = user_id);

-- Políticas para transactions: usuarios solo ven sus transacciones
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (
    account_id IN (
      SELECT id FROM accounts WHERE user_id = auth.uid()
    )
  );

-- Policies para audit_logs: solo lectura del propio usuario
CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- login_attempts: acceso permitido para inserts (el backend usa service_role)
-- No necesita policy de SELECT para usuarios normales

-- ===== 7. PERMISOS PARA SERVICE ROLE =====
-- El service_role key tiene acceso total, bypassing RLS.
-- Esto es usado por el backend (supabaseAdmin).

-- ===== LISTO =====
-- Después de ejecutar este script, configura tu .env con:
-- SUPABASE_URL=https://tu-proyecto.supabase.co
-- SUPABASE_ANON_KEY=tu-anon-key
-- SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
