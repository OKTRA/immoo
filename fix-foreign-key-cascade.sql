-- Script pour modifier la contrainte de clé étrangère et permettre la suppression en cascade
-- Cette approche est moins radicale si vous voulez garder certaines données

-- 1. Supprimer l'ancienne contrainte
ALTER TABLE user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_plan_id_fkey;

-- 2. Recréer la contrainte avec CASCADE
-- Maintenant, quand vous supprimez un plan, tous les abonnements associés seront automatiquement supprimés
ALTER TABLE user_subscriptions 
ADD CONSTRAINT user_subscriptions_plan_id_fkey 
FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- 3. Vérifier que la contrainte a été créée
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule,
    rc.update_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints rc 
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'user_subscriptions'
    AND kcu.column_name = 'plan_id';

-- Maintenant vous pouvez supprimer n'importe quel plan et ses abonnements associés seront automatiquement supprimés
-- Exemple : DELETE FROM subscription_plans WHERE id = 'plan_a_supprimer'; 