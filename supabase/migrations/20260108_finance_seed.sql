-- Seed default categories and account for new users
-- This function can be called by a trigger on user creation, or manually for existing users

CREATE OR REPLACE FUNCTION seed_finance_data(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Default Account
  INSERT INTO accounts (user_id, name, type, balance, currency)
  VALUES (target_user_id, 'Efectivo', 'cash', 0, 'EUR')
  ON CONFLICT DO NOTHING;

  -- Default Categories (Expense)
  INSERT INTO finance_categories (user_id, name, type, icon, color)
  VALUES 
    (target_user_id, 'Comida', 'expense', '🍔', '#ef4444'),
    (target_user_id, 'Transporte', 'expense', '🚌', '#3b82f6'),
    (target_user_id, 'Vivienda', 'expense', '🏠', '#8b5cf6'),
    (target_user_id, 'Ocio', 'expense', '🎉', '#ec4899'),
    (target_user_id, 'Salud', 'expense', '💊', '#10b981'),
    (target_user_id, 'Ropa', 'expense', '👕', '#f59e0b'),
    (target_user_id, 'Tecnología', 'expense', '💻', '#6366f1'),
    (target_user_id, 'Otros', 'expense', '📦', '#64748b')
  ON CONFLICT DO NOTHING;

  -- Default Categories (Income)
  INSERT INTO finance_categories (user_id, name, type, icon, color)
  VALUES 
    (target_user_id, 'Salario', 'income', '💰', '#10b981'),
    (target_user_id, 'Regalos', 'income', '🎁', '#f472b6'),
    (target_user_id, 'Otros', 'income', '📦', '#64748b')
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Trigger to seed data on new user
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  
  PERFORM seed_finance_data(new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Note: You need to attach this function to the auth.users INSERT trigger manually or via another migration if it doesn't exist.
-- Assuming 'on_auth_user_created' trigger exists, this updates it or you create one.