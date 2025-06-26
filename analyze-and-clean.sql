-- Script d'analyse et de nettoyage sélectif
-- Utilisez ce script pour voir exactement ce qui bloque avant de supprimer

-- 1. ANALYSER : Voir quels plans existent
SELECT 'PLANS EXISTANTS:' as section;
SELECT id, name, price, is_active, 
       (SELECT COUNT(*) FROM user_subscriptions WHERE plan_id = sp.id) as nb_abonnements
FROM subscription_plans sp
ORDER BY id;

-- 2. ANALYSER : Voir quels abonnements existent
SELECT 'ABONNEMENTS EXISTANTS:' as section;  
SELECT us.plan_id, us.status, COUNT(*) as count,
       sp.name as plan_name
FROM user_subscriptions us
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
GROUP BY us.plan_id, us.status, sp.name
ORDER BY us.plan_id, us.status;

-- 3. ANALYSER : Voir les utilisateurs avec abonnements
SELECT 'UTILISATEURS AVEC ABONNEMENTS:' as section;
SELECT us.user_id, us.plan_id, us.status, au.email
FROM user_subscriptions us
LEFT JOIN auth.users au ON us.user_id = au.id
ORDER BY us.plan_id;

-- 4. OPTIONS DE NETTOYAGE (décommentez ce que vous voulez faire):

-- Option A: Supprimer tous les abonnements inactifs/expirés
-- DELETE FROM user_subscriptions WHERE status IN ('inactive', 'expired', 'cancelled');

-- Option B: Supprimer tous les abonnements
-- DELETE FROM user_subscriptions;

-- Option C: Supprimer des plans spécifiques (remplacez 'plan_id_a_supprimer')
-- DELETE FROM user_subscriptions WHERE plan_id = 'plan_id_a_supprimer';
-- DELETE FROM subscription_plans WHERE id = 'plan_id_a_supprimer';

-- Option D: Remettre tous les abonnements sur le plan gratuit avant de supprimer les autres plans
-- UPDATE user_subscriptions SET plan_id = 'free' WHERE plan_id != 'free';
-- DELETE FROM subscription_plans WHERE id != 'free';

-- 5. VÉRIFICATION FINALE
SELECT 'VÉRIFICATION APRÈS NETTOYAGE:' as section;
SELECT 'Plans restants:' as info, COUNT(*) as count FROM subscription_plans;
SELECT 'Abonnements restants:' as info, COUNT(*) as count FROM user_subscriptions; 