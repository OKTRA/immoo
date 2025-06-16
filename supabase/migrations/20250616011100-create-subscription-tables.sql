-- Créer les tables de subscription manquantes
-- Cette migration ajoute les tables subscription_plans et user_subscriptions

-- Table des plans d'abonnement
CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly', -- 'monthly', 'yearly'
  max_agencies INTEGER NOT NULL DEFAULT 1,
  max_properties INTEGER NOT NULL DEFAULT 1,
  max_users INTEGER NOT NULL DEFAULT 1,
  max_leases INTEGER NOT NULL DEFAULT 1,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  has_api_access BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table des abonnements utilisateurs
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL,
  plan_id TEXT REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'pending'
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  payment_method TEXT DEFAULT 'free', -- 'free', 'card', 'bank_transfer'
  auto_renew BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Contrainte unique pour éviter les doublons d'abonnements actifs
  UNIQUE(user_id, status) DEFERRABLE INITIALLY DEFERRED
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_agency_id ON user_subscriptions(agency_id);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour automatiquement les timestamps
CREATE TRIGGER update_subscription_plans_updated_at 
    BEFORE UPDATE ON subscription_plans 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at 
    BEFORE UPDATE ON user_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Ajouter un plan gratuit par défaut
INSERT INTO subscription_plans (id, name, price, billing_cycle, max_agencies, max_properties, max_users, max_leases, features, is_active)
VALUES (
  'free',
  'Gratuit',
  0.00,
  'monthly',
  1,
  1,
  1,
  2,
  '["Gestion de base"]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- Politiques RLS (Row Level Security)
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Les plans d'abonnement sont visibles par tous les utilisateurs authentifiés
CREATE POLICY "Plans visibles par tous" ON subscription_plans
  FOR SELECT TO authenticated
  USING (is_active = true);

-- Seuls les admins peuvent modifier les plans
CREATE POLICY "Seuls les admins peuvent modifier les plans" ON subscription_plans
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid() 
    AND role_level IN ('admin', 'super_admin')
  ));

-- Les utilisateurs peuvent voir leurs propres abonnements
CREATE POLICY "Utilisateurs voient leurs abonnements" ON user_subscriptions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Seuls les admins peuvent modifier les abonnements
CREATE POLICY "Seuls les admins peuvent modifier les abonnements" ON user_subscriptions
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid() 
    AND role_level IN ('admin', 'super_admin')
  ));
