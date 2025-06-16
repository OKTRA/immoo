-- SQL simple pour créer les tables de subscription et corriger le problème

-- 1. Créer la table subscription_plans
CREATE TABLE IF NOT EXISTS subscription_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    billing_cycle TEXT NOT NULL DEFAULT 'monthly',
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

-- 2. Créer la table user_subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    agency_id UUID,
    plan_id TEXT REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'active',
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    payment_method TEXT DEFAULT 'free',
    auto_renew BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Ajouter index pour performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);

-- 4. Ajouter contrainte unique pour éviter doublons
ALTER TABLE user_subscriptions ADD CONSTRAINT IF NOT EXISTS user_subscriptions_user_id_unique UNIQUE(user_id);

-- 5. Insérer le plan gratuit
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

-- 6. Créer des abonnements pour tous les utilisateurs qui n'en ont pas
INSERT INTO user_subscriptions (user_id, plan_id, status, start_date, payment_method, auto_renew)
SELECT 
    au.id,
    'free',
    'active',
    CURRENT_DATE,
    'free',
    false
FROM auth.users au
WHERE au.id NOT IN (
    SELECT user_id 
    FROM user_subscriptions 
    WHERE user_id IS NOT NULL
)
ON CONFLICT (user_id) DO NOTHING;

-- 7. Vérification finale
SELECT 'Plans créés:' as message, COUNT(*) as count FROM subscription_plans;
SELECT 'Abonnements actifs:' as message, COUNT(*) as count FROM user_subscriptions WHERE status = 'active';
