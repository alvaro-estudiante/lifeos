-- =============================================
-- TRIGGER: Crear perfil y datos iniciales para nuevo usuario
-- Ejecutar DESPUÉS de 00_initial_schema.sql y las migraciones de finance
-- =============================================

-- Función que se ejecuta cuando se crea un nuevo usuario
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Crear perfil de usuario
  INSERT INTO public.user_profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));
  
  -- Crear objetivos nutricionales por defecto
  INSERT INTO public.nutrition_goals (user_id, calories_target, protein_g, carbs_g, fat_g, fiber_g, water_ml, is_active)
  VALUES (NEW.id, 2000, 150, 200, 65, 30, 2500, true);
  
  -- Crear cuenta de efectivo por defecto
  INSERT INTO public.accounts (user_id, name, type, balance, currency)
  VALUES (NEW.id, 'Efectivo', 'cash', 0, 'EUR');

  -- Categorías de gasto por defecto
  INSERT INTO public.finance_categories (user_id, name, type, icon, color) VALUES 
    (NEW.id, 'Comida', 'expense', '🍔', '#ef4444'),
    (NEW.id, 'Transporte', 'expense', '🚌', '#3b82f6'),
    (NEW.id, 'Vivienda', 'expense', '🏠', '#8b5cf6'),
    (NEW.id, 'Ocio', 'expense', '🎉', '#ec4899'),
    (NEW.id, 'Salud', 'expense', '💊', '#10b981'),
    (NEW.id, 'Ropa', 'expense', '👕', '#f59e0b'),
    (NEW.id, 'Tecnología', 'expense', '💻', '#6366f1'),
    (NEW.id, 'Otros', 'expense', '📦', '#64748b');

  -- Categorías de ingreso por defecto
  INSERT INTO public.finance_categories (user_id, name, type, icon, color) VALUES 
    (NEW.id, 'Salario', 'income', '💰', '#10b981'),
    (NEW.id, 'Regalos', 'income', '🎁', '#f472b6'),
    (NEW.id, 'Otros Ingresos', 'income', '📦', '#64748b');

  -- Hábitos de ejemplo
  INSERT INTO public.habits (user_id, name, description, frequency, target_value, unit, color, icon) VALUES
    (NEW.id, 'Beber agua', 'Beber 8 vasos de agua al día', 'daily', 8, 'vasos', '#3b82f6', '💧'),
    (NEW.id, 'Ejercicio', 'Hacer ejercicio o caminar', 'daily', 1, NULL, '#10b981', '💪');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar trigger existente si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Crear trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
