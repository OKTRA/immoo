-- Ajouter une colonne plan_id à la table profiles si elle n'existe pas
-- Cette migration résout le problème des utilisateurs agency qui n'ont pas d'abonnement

-- D'abord, s'assurer qu'il y a un plan gratuit par défaut
INSERT INTO subscription_plans (id, name, price, billing_cycle, max_agencies, max_properties, max_users, max_leases, features, is_active)
VALUES (
  'free-plan-default',
  'Plan Gratuit',
  0.00,
  'monthly',
  1,
  5,
  1,
  10,
  ARRAY['Gestion de base', 'Support email'],
  true
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  max_agencies = EXCLUDED.max_agencies,
  max_properties = EXCLUDED.max_properties,
  max_users = EXCLUDED.max_users,
  max_leases = EXCLUDED.max_leases,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active;

-- Créer des abonnements pour tous les utilisateurs qui n'en ont pas encore
-- Cela inclut l'utilisateur izoflores45@gmail.com avec le rôle agency
INSERT INTO user_subscriptions (
  id,
  user_id,
  plan_id,
  status,
  start_date,
  end_date,
  payment_method,
  auto_renew,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  au.id,
  'free-plan-default',
  'active',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 year',
  'free',
  false,
  now(),
  now()
FROM auth.users au
WHERE au.id NOT IN (
  SELECT user_id 
  FROM user_subscriptions 
  WHERE user_id IS NOT NULL
);

-- Mettre à jour spécifiquement pour l'utilisateur izoflores45@gmail.com s'il existe
UPDATE user_subscriptions 
SET 
  plan_id = 'free-plan-default',
  status = 'active',
  start_date = CURRENT_DATE,
  end_date = CURRENT_DATE + INTERVAL '1 year',
  updated_at = now()
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'izoflores45@gmail.com'
);

-- S'assurer que tous les utilisateurs avec des agences ont un abonnement actif
UPDATE user_subscriptions 
SET 
  status = 'active',
  updated_at = now()
WHERE user_id IN (
  SELECT DISTINCT user_id 
  FROM agencies 
  WHERE user_id IS NOT NULL
) AND status != 'active';
