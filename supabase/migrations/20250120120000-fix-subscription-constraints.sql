-- Migration pour résoudre le problème de contrainte de clé étrangère
-- Cette migration permet de manipuler les plans d'abonnement librement

-- 1. Sauvegarder les données existantes
CREATE TABLE IF NOT EXISTS backup_user_subscriptions_20250120 AS
SELECT * FROM user_subscriptions;

CREATE TABLE IF NOT EXISTS backup_subscription_plans_20250120 AS  
SELECT * FROM subscription_plans;

-- 2. Supprimer l'ancienne contrainte restrictive
ALTER TABLE user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_plan_id_fkey;

-- 3. Si vous voulez supprimer tous les abonnements (pas de plans actifs selon vous)
-- Décommentez la ligne suivante:
-- DELETE FROM user_subscriptions;

-- 4. Ou supprimer seulement les abonnements inactifs (décommentez si préféré):
-- DELETE FROM user_subscriptions WHERE status IN ('inactive', 'expired', 'cancelled');

-- 5. Maintenant vous pouvez supprimer les plans que vous voulez
-- Exemple (décommentez et adaptez selon vos besoins):
-- DELETE FROM subscription_plans WHERE id IN ('plan1', 'plan2');

-- 6. Recréer la contrainte avec CASCADE pour faciliter les futures manipulations
ALTER TABLE user_subscriptions 
ADD CONSTRAINT user_subscriptions_plan_id_fkey 
FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- 7. Créer un plan gratuit de base si nécessaire
INSERT INTO subscription_plans (id, name, price, billing_cycle, max_agencies, max_properties, max_users, max_leases, features, is_active) 
VALUES ('free', 'Gratuit', 0.00, 'monthly', 1, 5, 1, 10, '["Gestion de base"]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  max_agencies = EXCLUDED.max_agencies,
  max_properties = EXCLUDED.max_properties,
  max_users = EXCLUDED.max_users,
  max_leases = EXCLUDED.max_leases;

-- 8. Message de confirmation
SELECT 'Migration terminée: contrainte modifiée en CASCADE' as status; 