-- Vérifier les données de subscription pour izoflores45@gmail.com (problème de clignotement /agencies)

-- 1. Vérifier les données utilisateur actuelles
SELECT 'Profil utilisateur:' as section;
SELECT 
    p.id,
    p.email,
    p.first_name,
    p.last_name,
    p.role,
    p.agency_id,
    a.name as agency_name
FROM profiles p
LEFT JOIN agencies a ON p.agency_id = a.id
WHERE p.email = 'izoflores45@gmail.com';

-- 2. Vérifier les données de subscription
SELECT 'Subscription actuelle:' as section;
SELECT 
    us.id,
    us.user_id,
    us.plan_id,
    us.status,
    us.start_date,
    us.end_date,
    sp.name as plan_name,
    sp.max_agencies,
    sp.max_properties
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = '6a0e5fbb-7758-4143-9dcc-98e05ed0f27a';

-- 3. Si pas de subscription, en créer une
INSERT INTO user_subscriptions (
    id,
    user_id,
    plan_id,
    status,
    start_date,
    end_date
) 
SELECT 
    gen_random_uuid(),
    '6a0e5fbb-7758-4143-9dcc-98e05ed0f27a',
    '00000000-0000-0000-0000-000000000001', -- Plan gratuit
    'active',
    NOW(),
    NOW() + INTERVAL '1 year'
WHERE NOT EXISTS (
    SELECT 1 FROM user_subscriptions 
    WHERE user_id = '6a0e5fbb-7758-4143-9dcc-98e05ed0f27a'
);

-- 4. Vérifier le résultat final
SELECT 'Subscription après création:' as section;
SELECT 
    us.id,
    us.user_id,
    us.plan_id,
    us.status,
    us.start_date,
    us.end_date,
    sp.name as plan_name,
    sp.max_agencies,
    sp.max_properties
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = '6a0e5fbb-7758-4143-9dcc-98e05ed0f27a';
