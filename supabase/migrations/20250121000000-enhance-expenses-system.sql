-- Migration pour améliorer le système de dépenses
-- Date: 2025-01-21

-- 1. Améliorer la table des dépenses existante
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid'));
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS vendor_name TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS vendor_contact TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS payment_date DATE;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(user_id);
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS recurring BOOLEAN DEFAULT false;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS recurring_frequency TEXT CHECK (recurring_frequency IN ('monthly', 'quarterly', 'yearly', 'custom'));
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS next_due_date DATE;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS parent_expense_id UUID REFERENCES expenses(id);

-- 2. Créer une table pour les catégories de dépenses
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT 'receipt',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Créer une table pour les pièces jointes des dépenses
CREATE TABLE IF NOT EXISTS expense_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID NOT NULL REFERENCES profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Créer une table pour l'historique des dépenses
CREATE TABLE IF NOT EXISTS expense_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  changed_by UUID NOT NULL REFERENCES profiles(user_id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- 5. Insérer les catégories de dépenses par défaut
INSERT INTO expense_categories (name, description, color, icon) VALUES
('Maintenance', 'Maintenance générale et réparations', '#EF4444', 'wrench'),
('Rénovation', 'Travaux de rénovation et amélioration', '#F59E0B', 'hammer'),
('Services publics', 'Électricité, eau, gaz, internet', '#10B981', 'zap'),
('Assurance', 'Assurance propriété et responsabilité', '#3B82F6', 'shield'),
('Taxes', 'Taxes foncières et impôts', '#8B5CF6', 'file-text'),
('Nettoyage', 'Services de nettoyage et entretien', '#06B6D4', 'droplets'),
('Sécurité', 'Systèmes de sécurité et surveillance', '#84CC16', 'lock'),
('Jardinage', 'Entretien des espaces verts', '#22C55E', 'tree-pine'),
('Administration', 'Frais administratifs et gestion', '#6B7280', 'briefcase'),
('Marketing', 'Publicité et promotion', '#EC4899', 'megaphone'),
('Légal', 'Frais juridiques et conseils', '#F97316', 'scale'),
('Inspection', 'Inspections et certifications', '#6366F1', 'search'),
('Autres', 'Autres dépenses diverses', '#9CA3AF', 'more-horizontal')
ON CONFLICT (name) DO NOTHING;

-- 6. Créer des index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_expenses_property_id ON expenses(property_id);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_created_by ON expenses(created_by);
CREATE INDEX IF NOT EXISTS idx_expenses_recurring ON expenses(recurring);
CREATE INDEX IF NOT EXISTS idx_expenses_next_due_date ON expenses(next_due_date);

-- 7. Créer une vue pour les statistiques de dépenses par propriété
CREATE OR REPLACE VIEW property_expense_stats AS
SELECT
  p.id AS property_id,
  p.title AS property_title,
  p.agency_id,
  COUNT(e.id) AS total_expenses,
  COALESCE(SUM(CASE WHEN e.status = 'paid' THEN e.amount ELSE 0 END), 0) AS total_paid,
  COALESCE(SUM(CASE WHEN e.status = 'pending' THEN e.amount ELSE 0 END), 0) AS total_pending,
  COALESCE(SUM(CASE WHEN e.status = 'approved' THEN e.amount ELSE 0 END), 0) AS total_approved,
  COALESCE(AVG(e.amount), 0) AS average_expense,
  MAX(e.date) AS last_expense_date,
  COUNT(CASE WHEN e.recurring = true THEN 1 END) AS recurring_expenses_count
FROM properties p
LEFT JOIN expenses e ON p.id = e.property_id
GROUP BY p.id, p.title, p.agency_id;

-- 8. Créer une vue pour les dépenses avec détails complets
CREATE OR REPLACE VIEW expense_details AS
SELECT
  e.id,
  e.property_id,
  p.title AS property_title,
  p.location AS property_location,
  e.category,
  ec.name AS category_name,
  ec.color AS category_color,
  ec.icon AS category_icon,
  e.amount,
  e.date,
  e.status,
  e.priority,
  e.description,
  e.vendor_name,
  e.vendor_contact,
  e.payment_method,
  e.payment_date,
  e.receipt_url,
  e.recurring,
  e.recurring_frequency,
  e.next_due_date,
  e.tags,
  e.notes,
  e.created_by,
  creator.first_name AS creator_first_name,
  creator.last_name AS creator_last_name,
  e.approved_by,
  approver.first_name AS approver_first_name,
  approver.last_name AS approver_last_name,
  e.approved_at,
  e.created_at,
  e.updated_at,
  -- Calculer le montant total des pièces jointes
  COALESCE((
    SELECT COUNT(*)
    FROM expense_attachments ea
    WHERE ea.expense_id = e.id
  ), 0) AS attachments_count
FROM expenses e
LEFT JOIN properties p ON e.property_id = p.id
LEFT JOIN expense_categories ec ON e.category = ec.name
LEFT JOIN profiles creator ON e.created_by = creator.user_id
LEFT JOIN profiles approver ON e.approved_by = approver.user_id;

-- 9. Créer des politiques RLS pour la sécurité
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_history ENABLE ROW LEVEL SECURITY;

-- Politiques pour les dépenses
CREATE POLICY "Users can view expenses for their agency properties" ON expenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = expenses.property_id
      AND p.agency_id IN (
        SELECT agency_id FROM profiles
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create expenses for their agency properties" ON expenses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = expenses.property_id
      AND p.agency_id IN (
        SELECT agency_id FROM profiles
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update expenses for their agency properties" ON expenses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = expenses.property_id
      AND p.agency_id IN (
        SELECT agency_id FROM profiles
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete expenses for their agency properties" ON expenses
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = expenses.property_id
      AND p.agency_id IN (
        SELECT agency_id FROM profiles
        WHERE user_id = auth.uid()
      )
    )
  );

-- Politiques pour les catégories (lecture seule pour tous)
CREATE POLICY "Anyone can view expense categories" ON expense_categories
  FOR SELECT USING (true);

-- Politiques pour les pièces jointes
CREATE POLICY "Users can view attachments for their agency expenses" ON expense_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM expenses e
      JOIN properties p ON e.property_id = p.id
      WHERE e.id = expense_attachments.expense_id
      AND p.agency_id IN (
        SELECT agency_id FROM profiles
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create attachments for their agency expenses" ON expense_attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM expenses e
      JOIN properties p ON e.property_id = p.id
      WHERE e.id = expense_attachments.expense_id
      AND p.agency_id IN (
        SELECT agency_id FROM profiles
        WHERE user_id = auth.uid()
      )
    )
  );

-- 10. Créer des fonctions utilitaires
CREATE OR REPLACE FUNCTION calculate_property_net_income(
  property_id UUID,
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL
) RETURNS NUMERIC AS $$
DECLARE
  total_revenue NUMERIC := 0;
  total_expenses NUMERIC := 0;
  net_income NUMERIC := 0;
BEGIN
  -- Calculer les revenus (loyers payés)
  SELECT COALESCE(SUM(p.amount), 0)
  INTO total_revenue
  FROM payments p
  JOIN leases l ON p.lease_id = l.id
  WHERE l.property_id = calculate_property_net_income.property_id
    AND p.status = 'paid'
    AND p.payment_type = 'rent'
    AND (start_date IS NULL OR p.payment_date >= start_date)
    AND (end_date IS NULL OR p.payment_date <= end_date);

  -- Calculer les dépenses
  SELECT COALESCE(SUM(e.amount), 0)
  INTO total_expenses
  FROM expenses e
  WHERE e.property_id = calculate_property_net_income.property_id
    AND e.status = 'paid'
    AND (start_date IS NULL OR e.payment_date >= start_date)
    AND (end_date IS NULL OR e.payment_date <= end_date);

  -- Calculer le revenu net
  net_income := total_revenue - total_expenses;
  
  RETURN net_income;
END;
$$ LANGUAGE plpgsql;

-- 11. Créer un trigger pour l'historique des dépenses
CREATE OR REPLACE FUNCTION log_expense_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO expense_history (expense_id, action, new_values, changed_by)
    VALUES (NEW.id, 'created', to_jsonb(NEW), NEW.created_by);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO expense_history (expense_id, action, old_values, new_values, changed_by)
    VALUES (NEW.id, 'updated', to_jsonb(OLD), to_jsonb(NEW), COALESCE(NEW.approved_by, NEW.created_by));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO expense_history (expense_id, action, old_values, changed_by)
    VALUES (OLD.id, 'deleted', to_jsonb(OLD), OLD.created_by);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER expense_history_trigger
  AFTER INSERT OR UPDATE OR DELETE ON expenses
  FOR EACH ROW EXECUTE FUNCTION log_expense_changes();

-- 12. Créer une fonction pour générer les dépenses récurrentes
CREATE OR REPLACE FUNCTION generate_recurring_expenses()
RETURNS VOID AS $$
DECLARE
  expense_record RECORD;
  next_date DATE;
BEGIN
  FOR expense_record IN
    SELECT id, property_id, category, amount, description, vendor_name, 
           recurring_frequency, next_due_date, created_by
    FROM expenses
    WHERE recurring = true 
      AND next_due_date <= CURRENT_DATE
      AND status = 'paid'
  LOOP
    -- Calculer la prochaine date selon la fréquence
    CASE expense_record.recurring_frequency
      WHEN 'monthly' THEN
        next_date := expense_record.next_due_date + INTERVAL '1 month';
      WHEN 'quarterly' THEN
        next_date := expense_record.next_due_date + INTERVAL '3 months';
      WHEN 'yearly' THEN
        next_date := expense_record.next_due_date + INTERVAL '1 year';
      ELSE
        next_date := expense_record.next_due_date + INTERVAL '1 month';
    END CASE;

    -- Créer la nouvelle dépense récurrente
    INSERT INTO expenses (
      property_id, category, amount, date, description, vendor_name,
      status, recurring, recurring_frequency, next_due_date, created_by,
      parent_expense_id
    ) VALUES (
      expense_record.property_id, expense_record.category, expense_record.amount,
      expense_record.next_due_date, expense_record.description, expense_record.vendor_name,
      'pending', true, expense_record.recurring_frequency, next_date, expense_record.created_by,
      expense_record.id
    );

    -- Mettre à jour la date de la prochaine échéance pour l'expense parent
    UPDATE expenses 
    SET next_due_date = next_date
    WHERE id = expense_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql; 