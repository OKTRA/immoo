-- Migration pour résoudre le problème de contrainte de clé étrangère
-- Cette migration permet de manipuler les plans d'abonnement librement

-- 1. Sauvegarder les données existantes
CREATE TABLE IF NOT EXISTS backup_user_subscriptions_emergency AS
SELECT * FROM user_subscriptions;

CREATE TABLE IF NOT EXISTS backup_subscription_plans_emergency AS  
SELECT * FROM subscription_plans;

-- 2. Supprimer l'ancienne contrainte restrictive
ALTER TABLE user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_plan_id_fkey;

-- 3. ÉTAPES DE NETTOYAGE (décommentez selon vos besoins)

-- Option A: Supprimer TOUS les abonnements
DELETE FROM user_subscriptions;

-- Option B: Ou garder seulement les abonnements actifs (commentez la ligne au-dessus et décommentez celle-ci)
-- DELETE FROM user_subscriptions WHERE status != 'active';

-- 4. Maintenant vous pouvez supprimer/modifier tous les plans
DELETE FROM subscription_plans;

-- 5. Créer vos nouveaux plans
INSERT INTO subscription_plans (id, name, price, billing_cycle, max_agencies, max_properties, max_users, max_leases, features, is_active) VALUES
('free', 'Gratuit', 0.00, 'monthly', 1, 5, 1, 10, '["Gestion de base"]'::jsonb, true),
('starter', 'Starter', 15.00, 'monthly', 1, 20, 3, 50, '["Gestion avancée", "Support email"]'::jsonb, true),
('pro', 'Pro', 35.00, 'monthly', 3, 100, 10, 200, '["Gestion complète", "Support prioritaire", "API access"]'::jsonb, true),
('enterprise', 'Enterprise', 99.00, 'monthly', 10, 500, 50, 1000, '["Gestion illimitée", "Support 24/7", "API premium"]'::jsonb, true);

-- 6. Recréer la contrainte avec CASCADE
ALTER TABLE user_subscriptions 
ADD CONSTRAINT user_subscriptions_plan_id_fkey 
FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- 7. Créer des abonnements gratuits pour tous les utilisateurs
INSERT INTO user_subscriptions (user_id, plan_id, status, start_date, payment_method, auto_renew)
SELECT 
    au.id,
    'free',
    'active',
    CURRENT_DATE,
    'free',
    false
FROM auth.users au
ON CONFLICT DO NOTHING;

-- 8. Vérification finale
SELECT 'Nouveaux plans:' as info, COUNT(*) as count FROM subscription_plans;
SELECT 'Abonnements créés:' as info, COUNT(*) as count FROM user_subscriptions;

-- 9. Afficher les nouveaux plans
SELECT id, name, price, max_agencies, max_properties FROM subscription_plans ORDER BY price;

SELECT 'PROBLÈME RÉSOLU! Vous pouvez maintenant manipuler les plans librement.' as message; 