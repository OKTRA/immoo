-- SCRIPT D'URGENCE: Résoudre TOUTES les contraintes de clé étrangère
-- Exécutez ce script dans Supabase Dashboard > SQL Editor

-- ================================
-- 1. IDENTIFIER TOUTES LES CONTRAINTES
-- ================================
SELECT 'CONTRAINTES EXISTANTES:' as info;
SELECT 
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND ccu.table_name = 'subscription_plans'
    AND ccu.column_name = 'id';

-- ================================
-- 2. SUPPRIMER TOUTES LES CONTRAINTES VERS subscription_plans
-- ================================

-- Contrainte user_subscriptions -> subscription_plans
ALTER TABLE user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_plan_id_fkey;

-- Contrainte billing_history -> subscription_plans  
ALTER TABLE billing_history DROP CONSTRAINT IF EXISTS billing_history_plan_id_fkey;

-- Autres contraintes possibles (au cas où)
ALTER TABLE billing_history DROP CONSTRAINT IF EXISTS fk_billing_history_plan;
ALTER TABLE user_subscriptions DROP CONSTRAINT IF EXISTS fk_user_subscriptions_plan;

-- ================================
-- 3. NETTOYER LES DONNÉES RAPIDEMENT
-- ================================

-- Supprimer l'historique de facturation (ou le mettre à NULL)
-- OPTION A: Supprimer tout l'historique
DELETE FROM billing_history;

-- OPTION B: Ou garder l'historique en mettant plan_id à NULL (décommentez si préféré)
-- UPDATE billing_history SET plan_id = NULL;

-- Supprimer tous les abonnements
DELETE FROM user_subscriptions;

-- ================================
-- 4. SUPPRIMER TOUS LES PLANS
-- ================================
DELETE FROM subscription_plans;

-- ================================
-- 5. RECRÉER VOS PLANS
-- ================================
INSERT INTO subscription_plans (id, name, price, billing_cycle, max_agencies, max_properties, max_users, max_leases, features, is_active) VALUES
('free', 'Plan Gratuit', 0.00, 'monthly', 1, 3, 1, 5, '["Gestion de base"]'::jsonb, true),
('basic', 'Plan Basic', 25.00, 'monthly', 1, 15, 3, 30, '["Gestion standard", "Support email"]'::jsonb, true),
('premium', 'Plan Premium', 55.00, 'monthly', 3, 50, 10, 100, '["Gestion avancée", "Support prioritaire"]'::jsonb, true);

-- ================================
-- 6. RECRÉER LES CONTRAINTES AVEC CASCADE/SET NULL
-- ================================

-- user_subscriptions: CASCADE (si plan supprimé, abonnement supprimé)
ALTER TABLE user_subscriptions 
ADD CONSTRAINT user_subscriptions_plan_id_fkey 
FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- billing_history: SET NULL (si plan supprimé, garder l'historique avec plan_id = NULL)
ALTER TABLE billing_history 
ADD CONSTRAINT billing_history_plan_id_fkey 
FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- ================================
-- 7. CRÉER DES ABONNEMENTS GRATUITS
-- ================================
INSERT INTO user_subscriptions (user_id, plan_id, status, start_date, payment_method, auto_renew)
SELECT au.id, 'free', 'active', CURRENT_DATE, 'free', false
FROM auth.users au
ON CONFLICT DO NOTHING;

-- ================================
-- 8. VÉRIFICATION
-- ================================
SELECT '✅ PROBLÈME RÉSOLU!' as message;
SELECT 'Plans créés:' as info, COUNT(*) as count FROM subscription_plans;
SELECT 'Abonnements créés:' as info, COUNT(*) as count FROM user_subscriptions;

-- Afficher les nouveaux plans
SELECT id, name, price FROM subscription_plans ORDER BY price; 