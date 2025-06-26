-- SOLUTION COMPLÈTE POUR TOUTES LES CONTRAINTES DE CLÉ ÉTRANGÈRE
-- Ce script gère billing_history ET user_subscriptions

-- ================================
-- ÉTAPE 1: DIAGNOSTIC COMPLET
-- ================================
SELECT 'DIAGNOSTIC: Plans avec références dans user_subscriptions' as info;
SELECT sp.id, sp.name, COUNT(us.id) as nb_abonnements
FROM subscription_plans sp
LEFT JOIN user_subscriptions us ON sp.id = us.plan_id
GROUP BY sp.id, sp.name;

SELECT 'DIAGNOSTIC: Plans avec références dans billing_history' as info;
SELECT sp.id, sp.name, COUNT(bh.id) as nb_factures
FROM subscription_plans sp
LEFT JOIN billing_history bh ON sp.id = bh.plan_id
GROUP BY sp.id, sp.name;

-- ================================
-- ÉTAPE 2: SAUVEGARDER TOUTES LES DONNÉES
-- ================================
CREATE TABLE IF NOT EXISTS backup_subscription_plans_complete AS
SELECT * FROM subscription_plans;

CREATE TABLE IF NOT EXISTS backup_user_subscriptions_complete AS
SELECT * FROM user_subscriptions;

CREATE TABLE IF NOT EXISTS backup_billing_history_complete AS
SELECT * FROM billing_history;

-- ================================
-- ÉTAPE 3: SUPPRIMER TOUTES LES CONTRAINTES BLOQUANTES
-- ================================

-- Supprimer la contrainte user_subscriptions -> subscription_plans
ALTER TABLE user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_plan_id_fkey;

-- Supprimer la contrainte billing_history -> subscription_plans
ALTER TABLE billing_history DROP CONSTRAINT IF EXISTS billing_history_plan_id_fkey;

-- ================================
-- ÉTAPE 4: NETTOYER LES DONNÉES (CHOISISSEZ VOS OPTIONS)
-- ================================

-- Option A: Supprimer TOUT l'historique de facturation
DELETE FROM billing_history;

-- Option B: Ou mettre plan_id à NULL dans billing_history (gardez l'historique)
-- UPDATE billing_history SET plan_id = NULL;

-- Option C: Supprimer tous les abonnements
DELETE FROM user_subscriptions;

-- Option D: Ou mettre tous les abonnements sur un plan par défaut
-- UPDATE user_subscriptions SET plan_id = 'free' WHERE plan_id IS NOT NULL;

-- ================================
-- ÉTAPE 5: MAINTENANT VOUS POUVEZ SUPPRIMER/MODIFIER TOUS LES PLANS
-- ================================

-- Supprimer tous les plans existants
DELETE FROM subscription_plans;

-- ================================
-- ÉTAPE 6: CRÉER VOS NOUVEAUX PLANS
-- ================================
INSERT INTO subscription_plans (id, name, price, billing_cycle, max_agencies, max_properties, max_users, max_leases, features, is_active) VALUES
('free', 'Gratuit', 0.00, 'monthly', 1, 5, 1, 10, '["Gestion de base"]'::jsonb, true),
('starter', 'Starter', 19.99, 'monthly', 1, 20, 3, 50, '["Gestion avancée", "Support email"]'::jsonb, true),
('pro', 'Pro', 49.99, 'monthly', 3, 100, 10, 200, '["Gestion complète", "Support prioritaire", "API access"]'::jsonb, true),
('enterprise', 'Enterprise', 99.99, 'monthly', 10, 500, 50, 1000, '["Gestion illimitée", "Support 24/7", "API premium"]'::jsonb, true);

-- ================================
-- ÉTAPE 7: RECRÉER LES CONTRAINTES AVEC CASCADE
-- ================================

-- Contrainte user_subscriptions avec CASCADE
ALTER TABLE user_subscriptions 
ADD CONSTRAINT user_subscriptions_plan_id_fkey 
FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- Contrainte billing_history avec SET NULL (pour garder l'historique)
ALTER TABLE billing_history 
ADD CONSTRAINT billing_history_plan_id_fkey 
FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- ================================
-- ÉTAPE 8: CRÉER DES ABONNEMENTS GRATUITS POUR TOUS LES UTILISATEURS
-- ================================
INSERT INTO user_subscriptions (user_id, plan_id, status, start_date, payment_method, auto_renew)
SELECT 
    au.id,
    'free',
    'active',
    CURRENT_DATE,
    'free',
    false
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM user_subscriptions WHERE user_id = au.id
)
ON CONFLICT DO NOTHING;

-- ================================
-- ÉTAPE 9: VÉRIFICATION FINALE
-- ================================
SELECT 'RÉSULTAT: Nouveaux plans créés' as status, COUNT(*) as count FROM subscription_plans;
SELECT 'RÉSULTAT: Abonnements actifs' as status, COUNT(*) as count FROM user_subscriptions WHERE status = 'active';
SELECT 'RÉSULTAT: Historique facturation' as status, COUNT(*) as count FROM billing_history;

-- Afficher les nouveaux plans
SELECT '=== NOUVEAUX PLANS CRÉÉS ===' as info;
SELECT id, name, price, max_agencies, max_properties, max_leases FROM subscription_plans ORDER BY price;

SELECT '✅ TOUTES LES CONTRAINTES RÉSOLUES ! Vous pouvez maintenant manipuler les plans librement.' as message; 