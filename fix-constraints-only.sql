-- SCRIPT MINIMAL: Supprimer les contraintes bloquantes SEULEMENT
-- Après ça, vous gérez vos plans comme vous voulez

-- ================================
-- SUPPRIMER LES CONTRAINTES BLOQUANTES
-- ================================

-- Contrainte user_subscriptions -> subscription_plans
ALTER TABLE user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_plan_id_fkey;

-- Contrainte billing_history -> subscription_plans  
ALTER TABLE billing_history DROP CONSTRAINT IF EXISTS billing_history_plan_id_fkey;

-- ================================
-- NETTOYER LES RÉFÉRENCES (AU CHOIX)
-- ================================

-- OPTION A: Supprimer les données qui bloquent
-- DELETE FROM billing_history;
-- DELETE FROM user_subscriptions;

-- OPTION B: Ou mettre les références à NULL (garder les données)
-- UPDATE billing_history SET plan_id = NULL;
-- UPDATE user_subscriptions SET plan_id = NULL;

-- ================================
-- RECRÉER LES CONTRAINTES AVEC CASCADE (OPTIONNEL)
-- ================================

-- Si vous voulez éviter le problème à l'avenir (optionnel):
-- ALTER TABLE user_subscriptions 
-- ADD CONSTRAINT user_subscriptions_plan_id_fkey 
-- FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE;

-- ALTER TABLE billing_history 
-- ADD CONSTRAINT billing_history_plan_id_fkey 
-- FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE SET NULL;

-- ================================
-- TERMINÉ !
-- ================================
SELECT '✅ CONTRAINTES SUPPRIMÉES ! Vous pouvez maintenant gérer vos plans comme vous voulez.' as message; 