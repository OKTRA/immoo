-- Script pour nettoyer et manipuler les plans d'abonnement
-- Ce script vous permet de supprimer/modifier les plans sans contraintes

-- 1. Sauvegarder les données importantes avant le nettoyage
CREATE TABLE IF NOT EXISTS backup_user_subscriptions AS
SELECT * FROM user_subscriptions;

CREATE TABLE IF NOT EXISTS backup_subscription_plans AS  
SELECT * FROM subscription_plans;

-- 2. Désactiver temporairement la contrainte de clé étrangère
ALTER TABLE user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_plan_id_fkey;

-- 3. Option A: Supprimer TOUS les abonnements utilisateur (vous avez dit qu'il n'y a pas de plan actif)
DELETE FROM user_subscriptions;

-- 4. Option B: Ou supprimer seulement les abonnements inactifs (décommentez si préféré)
-- DELETE FROM user_subscriptions WHERE status != 'active';

-- 5. Maintenant vous pouvez supprimer/modifier tous les plans comme vous voulez
DELETE FROM subscription_plans;

-- 6. Créer vos nouveaux plans d'abonnement
-- Exemple de nouveaux plans:
INSERT INTO subscription_plans (id, name, price, billing_cycle, max_agencies, max_properties, max_users, max_leases, features, is_active) VALUES
('free', 'Gratuit', 0.00, 'monthly', 1, 5, 1, 10, '["Gestion de base"]'::jsonb, true),
('starter', 'Starter', 9.99, 'monthly', 1, 20, 3, 50, '["Gestion avancée", "Support email"]'::jsonb, true),
('pro', 'Pro', 29.99, 'monthly', 3, 100, 10, 200, '["Gestion complète", "Support prioritaire", "API access"]'::jsonb, true);

-- 7. Recréer la contrainte de clé étrangère avec CASCADE pour faciliter les futures manipulations
ALTER TABLE user_subscriptions 
ADD CONSTRAINT user_subscriptions_plan_id_fkey 
FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE;

-- 8. Créer des abonnements par défaut si nécessaire
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
    SELECT user_id FROM user_subscriptions WHERE user_id IS NOT NULL
)
ON CONFLICT DO NOTHING;

-- 9. Vérification des résultats
SELECT 'Nouveaux plans créés:' as info, COUNT(*) as count FROM subscription_plans;
SELECT 'Abonnements actifs:' as info, COUNT(*) as count FROM user_subscriptions WHERE status = 'active';

-- Message de confirmation
SELECT 'Nettoyage terminé ! Vous pouvez maintenant manipuler les plans librement.' as message; 