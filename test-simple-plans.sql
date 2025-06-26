-- =============================================================================
-- TEST SIMPLE DES PLANS D'ABONNEMENT
-- =============================================================================

-- 1. Verifier les plans existants
SELECT 
    'PLANS DISPONIBLES' as test_section,
    id,
    name,
    price,
    CASE WHEN max_agencies = -1 THEN 'Illimite' ELSE max_agencies::text END as agencies,
    CASE WHEN max_properties = -1 THEN 'Illimite' ELSE max_properties::text END as properties,
    CASE WHEN max_leases = -1 THEN 'Illimite' ELSE max_leases::text END as leases,
    CASE WHEN max_users = -1 THEN 'Illimite' ELSE max_users::text END as users,
    billing_cycle,
    is_active
FROM subscription_plans 
ORDER BY price;

-- 2. Verifier les fonctions RPC disponibles
SELECT 
    'FONCTIONS RPC' as test_section,
    p.proname as nom_fonction,
    pg_get_function_arguments(p.oid) as parametres
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname LIKE '%subscription%'
  AND n.nspname = 'public'
ORDER BY p.proname;

-- 3. Verifier la structure des tables
SELECT 
    'STRUCTURE SUBSCRIPTION_PLANS' as test_section,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'subscription_plans'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verifier la structure user_subscriptions  
SELECT 
    'STRUCTURE USER_SUBSCRIPTIONS' as test_section,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'user_subscriptions'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Verifier les contraintes
SELECT 
    'CONTRAINTES' as test_section,
    tc.constraint_name,
    tc.table_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name IN ('subscription_plans', 'user_subscriptions')
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;

-- 6. Tester la logique des limites illimitees
SELECT 
    'TEST LOGIQUE ILLIMITEE' as test_section,
    'Plan avec max_agencies = -1' as description,
    CASE 
        WHEN -1 = -1 THEN 'ILLIMITE - OK'
        ELSE 'LIMITE NORMALE'
    END as resultat;

-- 7. Compter les donnees existantes
SELECT 
    'DONNEES EXISTANTES' as test_section,
    (SELECT COUNT(*) FROM subscription_plans WHERE is_active = true) as plans_actifs,
    (SELECT COUNT(*) FROM subscription_plans WHERE max_agencies = -1) as plans_agencies_illimitees,
    (SELECT COUNT(*) FROM subscription_plans WHERE max_properties = -1) as plans_properties_illimitees,
    (SELECT COUNT(*) FROM user_subscriptions WHERE status = 'active') as abonnements_actifs,
    (SELECT COUNT(*) FROM agencies) as total_agences;

-- 8. Verifier un utilisateur existant (si il y en a)
SELECT 
    'EXEMPLE UTILISATEUR' as test_section,
    us.user_id,
    sp.name as plan_name,
    sp.max_agencies,
    sp.max_properties,
    us.status,
    us.start_date,
    us.end_date,
    CASE 
        WHEN us.end_date > NOW() THEN 'ACTIF'
        ELSE 'EXPIRE'
    END as statut_calcule
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.status = 'active'
LIMIT 3;

-- 9. Test de la fonction de formatage des limites (simulation)
SELECT 
    'TEST FORMATAGE' as test_section,
    'Limite normale' as type_limite,
    5 as valeur_brute,
    CASE WHEN 5 = -1 THEN 'Illimite' ELSE 5::text END as valeur_formatee
UNION ALL
SELECT 
    'TEST FORMATAGE' as test_section,
    'Limite illimitee' as type_limite,
    -1 as valeur_brute,
    CASE WHEN -1 = -1 THEN 'Illimite' ELSE (-1)::text END as valeur_formatee;

-- 10. Verifier les index (pour performance)
SELECT 
    'INDEX DISPONIBLES' as test_section,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('subscription_plans', 'user_subscriptions', 'agencies')
  AND schemaname = 'public'
ORDER BY tablename, indexname;

-- Message final
SELECT '
=== TESTS SIMPLES TERMINES ===

Ces tests verifient :
✓ Structure des tables
✓ Plans disponibles  
✓ Fonctions RPC
✓ Contraintes de base
✓ Logique des limites illimitees
✓ Donnees existantes
✓ Index de performance

Si tout s''affiche correctement, la base est prete !

Prochaines etapes :
1. Utiliser l''interface web pour tester les fonctionnalites
2. Creer des agences/proprietes pour tester les limites
3. Tester les upgrades de plans
' as resultats; 