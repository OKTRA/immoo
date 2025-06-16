-- Script pour déboguer le problème de subscription

-- 1. Vérifier les utilisateurs avec l'email izoflores45@gmail.com
SELECT 'Utilisateurs avec email izoflores45:' as info;
SELECT id, email, raw_user_meta_data->>'role' as role 
FROM auth.users 
WHERE email = 'izoflores45@gmail.com';

-- 2. Vérifier tous les plans créés
SELECT 'Plans disponibles:' as info;
SELECT id, name, max_agencies, max_properties FROM subscription_plans;

-- 3. Vérifier tous les abonnements utilisateurs
SELECT 'Abonnements existants:' as info;
SELECT us.user_id, us.plan_id, us.status, au.email 
FROM user_subscriptions us
LEFT JOIN auth.users au ON us.user_id = au.id;

-- 4. Vérifier l'abonnement spécifique de izoflores45
SELECT 'Abonnement de izoflores45:' as info;
SELECT us.*, sp.name as plan_name, sp.max_agencies
FROM user_subscriptions us
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
LEFT JOIN auth.users au ON us.user_id = au.id
WHERE au.email = 'izoflores45@gmail.com';

-- 5. Tester la requête exacte du service
SELECT 'Test requête service:' as info;
SELECT us.*, sp.*
FROM user_subscriptions us
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
LEFT JOIN auth.users au ON us.user_id = au.id
WHERE au.email = 'izoflores45@gmail.com';
