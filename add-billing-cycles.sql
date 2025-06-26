-- Script pour ajouter des exemples de plans avec les nouveaux cycles de facturation
-- Exécutez ce script dans Supabase Dashboard > SQL Editor

-- Ajouter des plans d'exemple avec les nouveaux cycles
INSERT INTO subscription_plans (id, name, price, billing_cycle, max_agencies, max_properties, max_users, max_leases, features, is_active) VALUES
('starter-monthly', 'Starter Mensuel', 15000.00, 'monthly', 1, 10, 2, 25, '["Gestion de base", "Support email"]'::jsonb, true),
('starter-quarterly', 'Starter Trimestriel', 40000.00, 'quarterly', 1, 10, 2, 25, '["Gestion de base", "Support email", "Économie de 11%"]'::jsonb, true),
('starter-semestriel', 'Starter Semestriel', 75000.00, 'semestriel', 1, 10, 2, 25, '["Gestion de base", "Support email", "Économie de 17%"]'::jsonb, true),
('pro-yearly', 'Pro Annuel', 480000.00, 'yearly', 3, 50, 10, 100, '["Gestion complète", "Support prioritaire", "API access", "Économie de 20%"]'::jsonb, true),
('enterprise-lifetime', 'Enterprise Lifetime', 2500000.00, 'lifetime', 10, 1000, 50, 5000, '["Gestion illimitée", "Support 24/7", "API premium", "Accès à vie", "Formation incluse"]'::jsonb, true)
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

-- Vérifier les nouveaux plans créés
SELECT 'NOUVEAUX CYCLES DE FACTURATION AJOUTÉS:' as info;
SELECT id, name, price, billing_cycle, 
       CASE 
         WHEN billing_cycle = 'monthly' THEN 'Mensuel'
         WHEN billing_cycle = 'quarterly' THEN 'Trimestriel'
         WHEN billing_cycle = 'semestriel' THEN 'Semestriel'
         WHEN billing_cycle = 'yearly' THEN 'Annuel'
         WHEN billing_cycle = 'lifetime' THEN 'À vie'
         ELSE billing_cycle 
       END as cycle_label
FROM subscription_plans 
WHERE billing_cycle IN ('quarterly', 'semestriel', 'lifetime')
ORDER BY 
  CASE billing_cycle 
    WHEN 'monthly' THEN 1
    WHEN 'quarterly' THEN 2  
    WHEN 'semestriel' THEN 3
    WHEN 'yearly' THEN 4
    WHEN 'lifetime' THEN 5
    ELSE 6
  END;

SELECT '✅ CYCLES SEMESTRIEL ET LIFETIME AJOUTÉS AVEC SUCCÈS!' as message; 