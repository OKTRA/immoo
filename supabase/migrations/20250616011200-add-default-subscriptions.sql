-- Ajouter des abonnements par défaut pour tous les utilisateurs existants
-- Cette migration résout le problème de clignotement pour les utilisateurs agency

-- Temporairement désactiver la contrainte unique pour permettre l'insertion
ALTER TABLE user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_user_id_status_key;

-- Créer des abonnements gratuits pour tous les utilisateurs qui n'en ont pas
INSERT INTO user_subscriptions (
  user_id,
  plan_id,
  status,
  start_date,
  end_date,
  payment_method,
  auto_renew
)
SELECT 
  au.id,
  'free',
  'active',
  CURRENT_DATE,
  NULL, -- Pas de date de fin pour le plan gratuit
  'free',
  false
FROM auth.users au
WHERE au.id NOT IN (
  SELECT user_id 
  FROM user_subscriptions 
  WHERE user_id IS NOT NULL
);

-- Remettre la contrainte unique mais en permettant plusieurs abonnements avec des statuts différents
ALTER TABLE user_subscriptions ADD CONSTRAINT user_subscriptions_user_id_active_unique 
  UNIQUE(user_id) DEFERRABLE INITIALLY DEFERRED;

-- S'assurer qu'il n'y a qu'un seul abonnement actif par utilisateur
-- Désactiver les anciens abonnements s'il y en a plusieurs
UPDATE user_subscriptions 
SET status = 'cancelled'
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM user_subscriptions
  WHERE status = 'active'
  ORDER BY user_id, created_at DESC
) AND status = 'active';

-- Log des utilisateurs créés pour vérification
DO $$
DECLARE
  user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count
  FROM user_subscriptions
  WHERE plan_id = 'free' AND status = 'active';
  
  RAISE NOTICE 'Nombre d''abonnements gratuits créés: %', user_count;
END $$;
