-- SOLUTION POUR ERREUR: violates foreign key constraint "user_subscriptions_plan_id_fkey"
-- Utilisez ce script dans Supabase Dashboard > SQL Editor

-- ================================
-- ÉTAPE 1: ANALYSER LA SITUATION
-- ================================
SELECT 'DIAGNOSTIC: Plans existants' as info;
SELECT id, name, price, 
       (SELECT COUNT(*) FROM user_subscriptions WHERE plan_id = sp.id) as nb_abonnements_lies
FROM subscription_plans sp;

SELECT 'DIAGNOSTIC: Abonnements par plan' as info;
SELECT plan_id, status, COUNT(*) 
FROM user_subscriptions 
GROUP BY plan_id, status;

-- ================================
-- ÉTAPE 2: SAUVEGARDER VOS DONNÉES
-- ================================
CREATE TABLE backup_plans_$(date +%Y%m%d) AS SELECT * FROM subscription_plans;
CREATE TABLE backup_subscriptions_$(date +%Y%m%d) AS SELECT * FROM user_subscriptions;

-- ================================
-- ÉTAPE 3: SUPPRIMER LA CONTRAINTE BLOQUANTE
-- ================================
ALTER TABLE user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_plan_id_fkey;

-- ================================
-- ÉTAPE 4: NETTOYER LES DONNÉES (CHOISISSEZ UNE OPTION)
-- ================================

-- OPTION A: Supprimer TOUS les abonnements (décommentez si vous voulez tout vider)
-- DELETE FROM user_subscriptions;

-- OPTION B: Supprimer seulement les abonnements inactifs
-- DELETE FROM user_subscriptions WHERE status IN ('inactive', 'expired', 'cancelled');

-- OPTION C: Mettre tous les abonnements sur plan gratuit avant de supprimer les autres plans
-- UPDATE user_subscriptions SET plan_id = 'free' WHERE plan_id != 'free';

-- ================================
-- ÉTAPE 5: MAINTENANT VOUS POUVEZ MANIPULER LES PLANS LIBREMENT
-- ================================

-- Supprimer les plans que vous voulez (exemples)
-- DELETE FROM subscription_plans WHERE id = 'plan_non_desire';
-- DELETE FROM subscription_plans WHERE price > 50;
-- DELETE FROM subscription_plans; -- Pour tout supprimer

-- ================================
-- ÉTAPE 6: CRÉER VOS NOUVEAUX PLANS
-- ================================
INSERT INTO subscription_plans (id, name, price, billing_cycle, max_agencies, max_properties, max_users, max_leases, features, is_active) VALUES
('free', 'Gratuit', 0.00, 'monthly', 1, 3, 1, 5, '["Gestion de base"]'::jsonb, true),
('basic', 'Basic', 19.99, 'monthly', 1, 15, 2, 30, '["Gestion standard", "Support email"]'::jsonb, true),
('pro', 'Pro', 49.99, 'monthly', 3, 50, 5, 100, '["Gestion avancée", "Support prioritaire"]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  max_agencies = EXCLUDED.max_agencies,
  max_properties = EXCLUDED.max_properties,
  max_users = EXCLUDED.max_users,
  max_leases = EXCLUDED.max_leases;

-- ================================
-- ÉTAPE 7: RECRÉER LA CONTRAINTE AVEC CASCADE
-- ================================
ALTER TABLE user_subscriptions 
ADD CONSTRAINT user_subscriptions_plan_id_fkey 
FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- ================================
-- ÉTAPE 8: VÉRIFICATION
-- ================================
SELECT 'RÉSULTAT: Nouveaux plans créés' as status, COUNT(*) as count FROM subscription_plans;
SELECT 'RÉSULTAT: Abonnements restants' as status, COUNT(*) as count FROM user_subscriptions;

-- ================================
-- ÉTAPE 9: CRÉER DES ABONNEMENTS GRATUITS POUR LES UTILISATEURS
-- ================================
INSERT INTO user_subscriptions (user_id, plan_id, status, start_date, payment_method, auto_renew)
SELECT au.id, 'free', 'active', CURRENT_DATE, 'free', false
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM user_subscriptions WHERE user_id = au.id)
ON CONFLICT DO NOTHING;

SELECT '✅ PROBLÈME RÉSOLU ! Vous pouvez maintenant manipuler les plans librement.' as message; 