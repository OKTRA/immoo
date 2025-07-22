-- =====================================================
-- SYSTÈME DE GESTION DES DÉPENSES - CRÉATION DES TABLES
-- =====================================================

-- 1. Table des catégories de dépenses
CREATE TABLE IF NOT EXISTS expense_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(50) DEFAULT 'receipt',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table principale des dépenses
CREATE TABLE IF NOT EXISTS expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'XOF',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- Informations sur le fournisseur
    vendor_name VARCHAR(200),
    vendor_contact VARCHAR(200),
    vendor_email VARCHAR(255),
    vendor_phone VARCHAR(50),
    
    -- Informations de paiement
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    payment_date DATE,
    due_date DATE,
    
    -- Dépense récurrente
    is_recurring BOOLEAN DEFAULT false,
    recurring_frequency VARCHAR(20) CHECK (recurring_frequency IN ('monthly', 'quarterly', 'yearly')),
    recurring_start_date DATE,
    recurring_end_date DATE,
    
    -- Dates importantes
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Utilisateurs
    created_by UUID REFERENCES profiles(id),
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Métadonnées
    tags TEXT[],
    notes TEXT,
    
    -- Audit
    version INTEGER DEFAULT 1
);

-- 3. Table des pièces jointes
CREATE TABLE IF NOT EXISTS expense_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by UUID REFERENCES profiles(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table de l'historique des dépenses
CREATE TABLE IF NOT EXISTS expense_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    changed_by UUID NOT NULL REFERENCES profiles(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    action VARCHAR(50) NOT NULL,
    field_name VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    notes TEXT
);

-- =====================================================
-- INDEX POUR LES PERFORMANCES
-- =====================================================

-- Index sur les dépenses
CREATE INDEX IF NOT EXISTS idx_expenses_property_id ON expenses(property_id);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_created_by ON expenses(created_by);
CREATE INDEX IF NOT EXISTS idx_expenses_recurring ON expenses(is_recurring, recurring_start_date);

-- Index sur les pièces jointes
CREATE INDEX IF NOT EXISTS idx_expense_attachments_expense_id ON expense_attachments(expense_id);

-- Index sur l'historique
CREATE INDEX IF NOT EXISTS idx_expense_history_expense_id ON expense_history(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_history_changed_at ON expense_history(changed_at);

-- =====================================================
-- VUES POUR LES REQUÊTES COMPLEXES
-- =====================================================

-- Vue des détails complets des dépenses
CREATE OR REPLACE VIEW expense_details AS
SELECT 
    e.*,
    p.title as property_title,
    p.location as property_location,
    p.agency_id,
    ec.name as category_name,
    ec.color as category_color,
    ec.icon as category_icon,
    creator.first_name as creator_first_name,
    creator.last_name as creator_last_name,
    approver.first_name as approver_first_name,
    approver.last_name as approver_last_name,
    (SELECT COUNT(*) FROM expense_attachments ea WHERE ea.expense_id = e.id) as attachments_count
FROM expenses e
LEFT JOIN properties p ON e.property_id = p.id
LEFT JOIN expense_categories ec ON e.category = ec.name
LEFT JOIN profiles creator ON e.created_by = creator.id
LEFT JOIN profiles approver ON e.approved_by = approver.id;

-- Vue des statistiques de dépenses par propriété
CREATE OR REPLACE VIEW property_expense_stats AS
SELECT 
    p.id as property_id,
    p.title as property_title,
    p.agency_id,
    COUNT(e.id) as total_expenses,
    SUM(CASE WHEN e.status = 'paid' THEN e.amount ELSE 0 END) as total_paid,
    SUM(CASE WHEN e.status = 'pending' THEN e.amount ELSE 0 END) as total_pending,
    SUM(CASE WHEN e.status = 'approved' THEN e.amount ELSE 0 END) as total_approved,
    SUM(CASE WHEN e.is_recurring = true THEN e.amount ELSE 0 END) as total_recurring,
    AVG(e.amount) as average_expense,
    MAX(e.date) as last_expense_date
FROM properties p
LEFT JOIN expenses e ON p.id = e.property_id
GROUP BY p.id, p.title, p.agency_id;

-- =====================================================
-- FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour calculer le revenu net d'une propriété
CREATE OR REPLACE FUNCTION calculate_property_net_income(property_uuid UUID)
RETURNS DECIMAL(12,2) AS $$
DECLARE
    total_revenue DECIMAL(12,2) := 0;
    total_expenses DECIMAL(12,2) := 0;
BEGIN
    -- Calculer le revenu total (loyers payés)
    SELECT COALESCE(SUM(amount), 0) INTO total_revenue
    FROM payments 
    WHERE property_id = property_uuid 
    AND status = 'paid';
    
    -- Calculer les dépenses totales (payées)
    SELECT COALESCE(SUM(amount), 0) INTO total_expenses
    FROM expenses 
    WHERE property_id = property_uuid 
    AND status = 'paid';
    
    RETURN total_revenue - total_expenses;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer les dépenses récurrentes
CREATE OR REPLACE FUNCTION generate_recurring_expenses()
RETURNS VOID AS $$
DECLARE
    expense_record RECORD;
    next_date DATE;
BEGIN
    FOR expense_record IN 
        SELECT * FROM expenses 
        WHERE is_recurring = true 
        AND (recurring_end_date IS NULL OR recurring_end_date >= CURRENT_DATE)
    LOOP
        -- Calculer la prochaine date
        CASE expense_record.recurring_frequency
            WHEN 'monthly' THEN
                next_date := expense_record.recurring_start_date + INTERVAL '1 month';
            WHEN 'quarterly' THEN
                next_date := expense_record.recurring_start_date + INTERVAL '3 months';
            WHEN 'yearly' THEN
                next_date := expense_record.recurring_start_date + INTERVAL '1 year';
        END CASE;
        
        -- Créer la nouvelle dépense si elle n'existe pas déjà
        IF NOT EXISTS (
            SELECT 1 FROM expenses 
            WHERE property_id = expense_record.property_id 
            AND category = expense_record.category 
            AND description = expense_record.description 
            AND date = next_date
        ) THEN
            INSERT INTO expenses (
                property_id, category, description, amount, currency,
                status, priority, vendor_name, vendor_contact, vendor_email,
                vendor_phone, payment_method, due_date, is_recurring,
                recurring_frequency, recurring_start_date, recurring_end_date,
                date, created_by, tags, notes
            ) VALUES (
                expense_record.property_id, expense_record.category, expense_record.description,
                expense_record.amount, expense_record.currency, 'pending', expense_record.priority,
                expense_record.vendor_name, expense_record.vendor_contact, expense_record.vendor_email,
                expense_record.vendor_phone, expense_record.payment_method, next_date + INTERVAL '30 days',
                true, expense_record.recurring_frequency, next_date, expense_record.recurring_end_date,
                next_date, expense_record.created_by, expense_record.tags, expense_record.notes
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS POUR L'AUDIT
-- =====================================================

-- Fonction pour enregistrer l'historique
CREATE OR REPLACE FUNCTION log_expense_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO expense_history (expense_id, changed_by, action, notes)
        VALUES (NEW.id, NEW.created_by, 'created', 'Dépense créée');
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Enregistrer les changements de statut
        IF OLD.status != NEW.status THEN
            INSERT INTO expense_history (expense_id, changed_by, action, field_name, old_value, new_value)
            VALUES (NEW.id, COALESCE(NEW.approved_by, NEW.created_by), 'status_changed', 'status', OLD.status, NEW.status);
        END IF;
        
        -- Enregistrer les changements de montant
        IF OLD.amount != NEW.amount THEN
            INSERT INTO expense_history (expense_id, changed_by, action, field_name, old_value, new_value)
            VALUES (NEW.id, NEW.created_by, 'amount_changed', 'amount', OLD.amount::text, NEW.amount::text);
        END IF;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO expense_history (expense_id, changed_by, action, notes)
        VALUES (OLD.id, OLD.created_by, 'deleted', 'Dépense supprimée');
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour l'audit des dépenses
CREATE TRIGGER expense_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON expenses
    FOR EACH ROW EXECUTE FUNCTION log_expense_changes();

-- =====================================================
-- POLITIQUES RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_history ENABLE ROW LEVEL SECURITY;

-- Politiques pour les dépenses
CREATE POLICY "Users can view expenses for their agency properties" ON expenses
    FOR SELECT USING (
        property_id IN (
            SELECT id FROM properties 
            WHERE agency_id IN (
                SELECT agency_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can create expenses for their agency properties" ON expenses
    FOR INSERT WITH CHECK (
        property_id IN (
            SELECT id FROM properties 
            WHERE agency_id IN (
                SELECT agency_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update expenses for their agency properties" ON expenses
    FOR UPDATE USING (
        property_id IN (
            SELECT id FROM properties 
            WHERE agency_id IN (
                SELECT agency_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can delete expenses for their agency properties" ON expenses
    FOR DELETE USING (
        property_id IN (
            SELECT id FROM properties 
            WHERE agency_id IN (
                SELECT agency_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

-- Politiques pour les catégories (lecture seule pour tous)
CREATE POLICY "Anyone can view expense categories" ON expense_categories
    FOR SELECT USING (true);

-- Politiques pour les pièces jointes
CREATE POLICY "Users can view attachments for their agency expenses" ON expense_attachments
    FOR SELECT USING (
        expense_id IN (
            SELECT e.id FROM expenses e
            JOIN properties p ON e.property_id = p.id
            WHERE p.agency_id IN (
                SELECT agency_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can upload attachments for their agency expenses" ON expense_attachments
    FOR INSERT WITH CHECK (
        expense_id IN (
            SELECT e.id FROM expenses e
            JOIN properties p ON e.property_id = p.id
            WHERE p.agency_id IN (
                SELECT agency_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

-- Politiques pour l'historique
CREATE POLICY "Users can view history for their agency expenses" ON expense_history
    FOR SELECT USING (
        expense_id IN (
            SELECT e.id FROM expenses e
            JOIN properties p ON e.property_id = p.id
            WHERE p.agency_id IN (
                SELECT agency_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

-- =====================================================
-- DONNÉES INITIALES
-- =====================================================

-- Insérer les catégories de dépenses par défaut
INSERT INTO expense_categories (name, description, color, icon) VALUES
('maintenance', 'Maintenance et réparations', '#EF4444', 'wrench'),
('utilities', 'Services publics (électricité, eau, etc.)', '#3B82F6', 'zap'),
('insurance', 'Assurance propriétaire', '#10B981', 'shield'),
('taxes', 'Taxes foncières et impôts', '#F59E0B', 'file-text'),
('cleaning', 'Nettoyage et entretien', '#8B5CF6', 'droplets'),
('security', 'Sécurité et surveillance', '#6366F1', 'lock'),
('landscaping', 'Aménagement paysager', '#84CC16', 'tree'),
('management', 'Frais de gestion', '#F97316', 'briefcase'),
('legal', 'Frais juridiques', '#EC4899', 'scale'),
('other', 'Autres dépenses', '#6B7280', 'more-horizontal')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- MESSAGE DE CONFIRMATION
-- =====================================================

SELECT 'Tables du système de dépenses créées avec succès!' as message; 