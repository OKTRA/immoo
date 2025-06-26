-- Script pour ajouter des exemples de plans avec limites illimitées
-- Exécutez ce script dans Supabase Dashboard > SQL Editor

-- Ajouter des plans avec limites illimitées (-1)
INSERT INTO subscription_plans (id, name, price, billing_cycle, max_agencies, max_properties, max_users, max_leases, features, is_active) VALUES
('starter-basic', 'Starter Basic', 10000.00, 'monthly', 1, 10, 2, 20, '["Gestion de base", "Support email"]'::jsonb, true),
('pro-standard', 'Pro Standard', 25000.00, 'monthly', 3, 50, 5, 100, '["Gestion avancée", "Support prioritaire"]'::jsonb, true),
('pro-unlimited-properties', 'Pro Propriétés Illimitées', 45000.00, 'monthly', 5, -1, 10, 200, '["Propriétés illimitées", "Gestion avancée", "Support prioritaire"]'::jsonb, true),
('enterprise-standard', 'Enterprise Standard', 75000.00, 'monthly', 10, 200, 25, 500, '["Gestion enterprise", "Support 24/7", "API access"]'::jsonb, true),
('enterprise-unlimited', 'Enterprise Illimité', 150000.00, 'monthly', -1, -1, -1, -1, '["Tout illimité", "Support 24/7", "API premium", "Formation incluse"]'::jsonb, true),
('ultimate-lifetime', 'Ultimate Lifetime', 2000000.00, 'lifetime', -1, -1, -1, -1, '["Accès à vie", "Tout illimité", "Support VIP", "API premium", "Formations personnalisées"]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  billing_cycle = EXCLUDED.billing_cycle,
  max_agencies = EXCLUDED.max_agencies,
  max_properties = EXCLUDED.max_properties,
  max_users = EXCLUDED.max_users,
  max_leases = EXCLUDED.max_leases,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active;

-- Vérifier les plans avec limites illimitées
SELECT 'PLANS AVEC LIMITES ILLIMITÉES:' as info;
SELECT 
  id, 
  name, 
  price,
  CASE 
    WHEN max_agencies = -1 THEN 'Illimité'
    ELSE max_agencies::text
  END as agences,
  CASE 
    WHEN max_properties = -1 THEN 'Illimité'
    ELSE max_properties::text
  END as proprietes,
  CASE 
    WHEN max_users = -1 THEN 'Illimité'
    ELSE max_users::text
  END as utilisateurs,
  CASE 
    WHEN max_leases = -1 THEN 'Illimité'
    ELSE max_leases::text
  END as baux
FROM subscription_plans 
WHERE max_agencies = -1 OR max_properties = -1 OR max_users = -1 OR max_leases = -1
ORDER BY price;

-- Vérifier tous les plans avec leurs limites
SELECT 'TOUS LES PLANS:' as info;
SELECT 
  id,
  name,
  price,
  billing_cycle,
  CASE WHEN max_agencies = -1 THEN 'Illimité' ELSE max_agencies::text END as agences,
  CASE WHEN max_properties = -1 THEN 'Illimité' ELSE max_properties::text END as proprietes,
  CASE WHEN max_users = -1 THEN 'Illimité' ELSE max_users::text END as utilisateurs,
  CASE WHEN max_leases = -1 THEN 'Illimité' ELSE max_leases::text END as baux
FROM subscription_plans 
ORDER BY price;

SELECT '✅ EXEMPLES DE PLANS AVEC LIMITES ILLIMITÉES AJOUTÉS!' as message; 