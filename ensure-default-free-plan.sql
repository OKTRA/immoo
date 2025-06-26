-- Script pour garantir que TOUS les utilisateurs d'agences ont le plan gratuit par défaut
-- ID standardisé: 00000000-0000-0000-0000-000000000001

-- DÉBUT: Attribution du plan gratuit par défaut à tous les utilisateurs

-- 1. Créer/Mettre à jour le plan gratuit standard
INSERT INTO subscription_plans (
    id, 
    name, 
    price, 
    billing_cycle, 
    max_agencies, 
    max_properties, 
    max_users, 
    max_leases, 
    features, 
    is_active,
    has_api_access,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Gratuit',
    0.00,
    'monthly',
    1,
    1,  -- 1 propriété max pour plan gratuit
    1,  -- 1 utilisateur max
    2,  -- 2 baux max
    '["Gestion de base", "Support email"]'::jsonb,
    true,
    false,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = 'Gratuit',
    price = 0.00,
    billing_cycle = 'monthly',
    max_agencies = 1,
    max_properties = 1,
    max_users = 1,
    max_leases = 2,
    features = '["Gestion de base", "Support email"]'::jsonb,
    is_active = true,
    has_api_access = false,
    updated_at = NOW();

-- Plan gratuit standard créé/mis à jour

-- 2. Nettoyer les anciens plans gratuits avec des IDs différents
DELETE FROM subscription_plans 
WHERE (name ILIKE '%gratuit%' OR name ILIKE '%free%' OR price = 0)
AND id != '00000000-0000-0000-0000-000000000001'::uuid;

-- Anciens plans gratuits supprimés

-- 3. Assigner le plan gratuit à TOUS les utilisateurs sans abonnement actif
INSERT INTO user_subscriptions (
    user_id,
    agency_id,
    plan_id,
    status,
    start_date,
    end_date,
    auto_renew,
    created_at,
    updated_at
)
SELECT 
    au.id,
    ag.id,  -- Lier à l'agence si elle existe
    '00000000-0000-0000-0000-000000000001'::uuid,
    'active',
    CURRENT_DATE,
    NULL,  -- Plan gratuit sans expiration
    false,
    NOW(),
    NOW()
FROM auth.users au
LEFT JOIN agencies ag ON ag.user_id = au.id
WHERE au.id NOT IN (
    SELECT user_id 
    FROM user_subscriptions 
    WHERE user_id IS NOT NULL 
    AND status = 'active'
);

-- Abonnements gratuits créés pour tous les utilisateurs

-- 4. Corriger les abonnements existants qui pointent vers de mauvais plans gratuits
UPDATE user_subscriptions 
SET 
    plan_id = '00000000-0000-0000-0000-000000000001'::uuid,
    updated_at = NOW()
WHERE plan_id IN (
    SELECT id FROM subscription_plans 
    WHERE (name ILIKE '%gratuit%' OR name ILIKE '%free%' OR price = 0)
    AND id != '00000000-0000-0000-0000-000000000001'::uuid
);

-- 5. S'assurer qu'il n'y a qu'un seul abonnement actif par utilisateur
-- Désactiver les doublons en gardant le plus récent
UPDATE user_subscriptions 
SET status = 'cancelled', updated_at = NOW()
WHERE id NOT IN (
    SELECT DISTINCT ON (user_id) id
    FROM user_subscriptions
    WHERE status = 'active'
    ORDER BY user_id, updated_at DESC
) AND status = 'active';

-- Doublons d'abonnements résolus

-- 6. VÉRIFICATIONS FINALES:

SELECT 
    'Utilisateurs totaux' as description,
    COUNT(*) as count
FROM auth.users;

SELECT 
    'Agences totales' as description,
    COUNT(*) as count
FROM agencies;

SELECT 
    'Abonnements actifs' as description,
    COUNT(*) as count
FROM user_subscriptions 
WHERE status = 'active';

SELECT 
    'Plan gratuit standard' as description,
    COUNT(*) as count
FROM subscription_plans 
WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;

SELECT 
    'Utilisateurs avec plan gratuit' as description,
    COUNT(*) as count
FROM user_subscriptions us
JOIN subscription_plans sp ON sp.id = us.plan_id
WHERE us.status = 'active' 
AND sp.id = '00000000-0000-0000-0000-000000000001'::uuid;

-- 7. Afficher les utilisateurs sans abonnement (ne devrait être vide)
SELECT 
    'Utilisateurs SANS abonnement' as description,
    COUNT(*) as count
FROM auth.users au
WHERE au.id NOT IN (
    SELECT user_id 
    FROM user_subscriptions 
    WHERE user_id IS NOT NULL 
    AND status = 'active'
);

-- 8. Détail des abonnements par plan
SELECT 
    'RÉPARTITION DES ABONNEMENTS' as section,
    sp.name as plan_name,
    sp.price,
    COUNT(us.id) as subscribers_count
FROM subscription_plans sp
LEFT JOIN user_subscriptions us ON us.plan_id = sp.id AND us.status = 'active'
WHERE sp.is_active = true
GROUP BY sp.id, sp.name, sp.price
ORDER BY sp.price;

-- TERMINÉ: Tous les utilisateurs ont maintenant le plan gratuit par défaut! 