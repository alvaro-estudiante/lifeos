-- Cuentas (Efectivo, Banco, Ahorros)
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('cash', 'bank', 'savings', 'credit', 'other')) DEFAULT 'bank',
  balance NUMERIC(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categorías de gastos/ingresos
CREATE TABLE finance_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')),
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Presupuestos mensuales por categoría
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES finance_categories(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  month DATE DEFAULT CURRENT_DATE, -- Primer día del mes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_id, month)
);

-- Transacciones
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  category_id UUID REFERENCES finance_categories(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense', 'transfer')),
  description TEXT,
  transaction_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date);
CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_budgets_user_month ON budgets(user_id, month);

-- RLS
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own accounts" ON accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own categories" ON finance_categories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own budgets" ON budgets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);

-- Categorías por defecto (insertar al crear usuario si fuera trigger, pero aquí manual o por seed)
-- Comida, Transporte, Vivienda, Salud, Ocio, Salario, Regalos, etc.