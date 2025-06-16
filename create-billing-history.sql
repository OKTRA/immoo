-- Créer la table billing_history pour le suivi des paiements d'abonnements
-- Basée sur la structure définie dans types.ts

CREATE TABLE IF NOT EXISTS billing_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL,
    plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL,
    subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    billing_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    payment_date TIMESTAMP WITH TIME ZONE,
    payment_method VARCHAR(100),
    transaction_id VARCHAR(255) UNIQUE,
    invoice_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_billing_history_user_id ON billing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_agency_id ON billing_history(agency_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_plan_id ON billing_history(plan_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_subscription_id ON billing_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_status ON billing_history(status);
CREATE INDEX IF NOT EXISTS idx_billing_history_billing_date ON billing_history(billing_date);

-- Contraintes de validation
ALTER TABLE billing_history ADD CONSTRAINT check_amount_positive CHECK (amount >= 0);
ALTER TABLE billing_history ADD CONSTRAINT check_status_valid CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'refunded'));

-- Insérer quelques données de test pour voir si ça fonctionne
INSERT INTO billing_history (
    user_id, 
    plan_id, 
    amount, 
    status, 
    billing_date, 
    payment_date, 
    payment_method, 
    description
) VALUES 
(
    (SELECT id FROM profiles WHERE email = 'izoflores45@gmail.com'),
    '00000000-0000-0000-0000-000000000001', -- Plan gratuit
    0.00,
    'paid',
    NOW() - INTERVAL '1 month',
    NOW() - INTERVAL '1 month',
    'gratuit',
    'Abonnement gratuit'
),
(
    (SELECT id FROM profiles WHERE email = 'izoflores45@gmail.com'),
    '00000000-0000-0000-0000-000000000001', -- Plan gratuit
    0.00,
    'paid',
    NOW(),
    NOW(),
    'gratuit',
    'Renouvellement abonnement gratuit'
);

-- Vérifier que la table a été créée correctement
SELECT 'Table billing_history créée avec succès' as status;
SELECT COUNT(*) as nombre_enregistrements FROM billing_history;
