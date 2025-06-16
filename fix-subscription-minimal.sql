-- SQL minimal pour corriger le problème sans modifier la structure existante

-- 1. D'abord vérifier la structure existante
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_subscriptions' AND table_schema = 'public';

-- 2. Créer subscription_plans si elle n'existe pas
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 3. Insérer le plan gratuit
INSERT INTO subscription_plans (id, name, price, billing_cycle, max_agencies, max_properties, max_users, max_leases, features, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
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

-- 4. Insérer seulement les colonnes qui existent dans user_subscriptions
INSERT INTO user_subscriptions (user_id, plan_id, status)
SELECT 
    au.id,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'active'
FROM auth.users au
WHERE au.id NOT IN (
    SELECT user_id FROM user_subscriptions WHERE user_id IS NOT NULL
)
ON CONFLICT DO NOTHING;

-- 5. Vérifier les résultats
SELECT 'Plans créés:' as message, COUNT(*) as count FROM subscription_plans;
SELECT 'Abonnements actifs:' as message, COUNT(*) as count FROM user_subscriptions WHERE status = 'active';
