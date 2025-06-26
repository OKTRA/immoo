-- =============================================================================
-- TEST COMPLET DES PLANS D'ABONNEMENT - VERSION PROPRE
-- =============================================================================

-- 1. PREPARATION : Nettoyer et preparer les donnees de test
DO $$
BEGIN
    -- Creer un utilisateur de test si inexistant
    INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, updated_at, email_confirmed_at)
    VALUES (
        'test-user-001',
        'test@plan-verification.com',
        '{"name": "Test User Plans"}',
        NOW(),
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO NOTHING;

    -- Creer son profil
    INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
    VALUES (
        'test-user-001',
        'test@plan-verification.com',
        'Test User Plans',
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'Utilisateur de test cree : test-user-001';
END $$;

-- =============================================================================
-- 2. TESTS DES PLANS ET LEURS LIMITES
-- =============================================================================

-- Test 1: Verifier les plans existants
SELECT 
    'PLANS EXISTANTS' as test_name,
    name,
    price,
    CASE WHEN max_agencies = -1 THEN 'Illimite' ELSE max_agencies::text END as max_agencies,
    CASE WHEN max_properties = -1 THEN 'Illimite' ELSE max_properties::text END as max_properties,
    CASE WHEN max_leases = -1 THEN 'Illimite' ELSE max_leases::text END as max_leases,
    CASE WHEN max_users = -1 THEN 'Illimite' ELSE max_users::text END as max_users,
    billing_cycle,
    is_active
FROM subscription_plans 
ORDER BY price;

-- Test 2: Verifier la fonction d'activation d'abonnement
SELECT 'TEST ACTIVATION PLAN GRATUIT' as test_name;

-- Activer le plan gratuit pour notre utilisateur test
SELECT activate_subscription_with_promo(
    'test-user-001'::uuid,
    (SELECT id FROM subscription_plans WHERE name ILIKE '%gratuit%' OR name ILIKE '%free%' LIMIT 1)::text,
    NULL -- Pas de promo
);

-- Verifier l'abonnement cree
SELECT 
    'ABONNEMENT CREE' as resultat,
    us.user_id,
    sp.name as plan_name,
    us.start_date,
    us.end_date,
    us.status,
    CASE 
        WHEN us.end_date > NOW() THEN 'Actif'
        ELSE 'Expire' 
    END as statut_reel
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = 'test-user-001';

-- =============================================================================
-- 3. TESTS DES LIMITES PAR RESSOURCE
-- =============================================================================

-- Test 3: Creer des agences pour tester les limites
DO $$
DECLARE
    agency_id1 uuid;
    agency_id2 uuid;
    plan_max_agencies int;
BEGIN
    -- Recuperer la limite d'agences du plan actuel
    SELECT sp.max_agencies INTO plan_max_agencies
    FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = 'test-user-001' AND us.status = 'active';

    RAISE NOTICE 'Limite agences du plan : %', 
        CASE WHEN plan_max_agencies = -1 THEN 'Illimite' ELSE plan_max_agencies::text END;

    -- Creer premiere agence
    INSERT INTO agencies (id, user_id, name, description, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        'test-user-001',
        'Test Agency 1',
        'Premiere agence de test',
        NOW(),
        NOW()
    ) RETURNING id INTO agency_id1;

    RAISE NOTICE 'Agence 1 creee : %', agency_id1;

    -- Creer deuxieme agence (peut echouer si limite = 1)
    BEGIN
        INSERT INTO agencies (id, user_id, name, description, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            'test-user-001',
            'Test Agency 2',
            'Deuxieme agence de test',
            NOW(),
            NOW()
        ) RETURNING id INTO agency_id2;
        
        RAISE NOTICE 'Agence 2 creee : %', agency_id2;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Agence 2 non creee (limite atteinte?) : %', SQLERRM;
    END;
END $$;

-- Test 4: Verifier le comptage des ressources
SELECT 
    'DECOMPTE ACTUEL DES RESSOURCES' as test_name,
    (SELECT COUNT(*) FROM agencies WHERE user_id = 'test-user-001') as agencies_count,
    (SELECT COUNT(*) FROM properties p 
     JOIN agencies a ON p.agency_id = a.id 
     WHERE a.user_id = 'test-user-001') as properties_count,
    (SELECT COUNT(*) FROM leases l
     JOIN properties p ON l.property_id = p.id
     JOIN agencies a ON p.agency_id = a.id 
     WHERE a.user_id = 'test-user-001') as leases_count;

-- =============================================================================
-- 4. TESTS D'UPGRADE DE PLAN
-- =============================================================================

-- Test 5: Simuler un upgrade vers un plan superieur
DO $$
DECLARE
    premium_plan_id uuid;
    current_subscription_id uuid;
BEGIN
    -- Trouver un plan premium (avec plus de limites)
    SELECT id INTO premium_plan_id
    FROM subscription_plans 
    WHERE max_agencies > 1 OR max_agencies = -1
    ORDER BY price DESC 
    LIMIT 1;

    IF premium_plan_id IS NOT NULL THEN
        RAISE NOTICE 'Test upgrade vers plan premium : %', premium_plan_id;
        
        -- Simuler l'upgrade
        SELECT activate_subscription_with_promo(
            'test-user-001'::uuid,
            premium_plan_id::text,
            NULL
        );
        
        RAISE NOTICE 'Upgrade effectue';
    ELSE
        RAISE NOTICE 'Aucun plan premium trouve pour test upgrade';
    END IF;
END $$;

-- Verifier le nouvel abonnement apres upgrade
SELECT 
    'ABONNEMENT APRES UPGRADE' as test_name,
    us.user_id,
    sp.name as nouveau_plan,
    sp.max_agencies,
    sp.max_properties,
    us.start_date,
    us.end_date,
    us.status
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = 'test-user-001' AND us.status = 'active';

-- =============================================================================
-- 5. TESTS DES LIMITES ILLIMITEES
-- =============================================================================

-- Test 6: Creer un plan avec limites illimitees pour test
INSERT INTO subscription_plans (
    id, name, description, price, billing_cycle,
    max_agencies, max_properties, max_leases, max_users,
    is_active, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'Test Unlimited Plan',
    'Plan de test avec limites illimitees',
    99.99,
    'monthly',
    -1, -1, -1, -1,  -- Tout illimite
    true,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- Activer le plan illimite
SELECT activate_subscription_with_promo(
    'test-user-001'::uuid,
    (SELECT id FROM subscription_plans WHERE name = 'Test Unlimited Plan')::text,
    NULL
);

-- Test de creation multiple avec plan illimite
DO $$
DECLARE
    i int;
    agency_id uuid;
BEGIN
    FOR i IN 1..5 LOOP
        INSERT INTO agencies (id, user_id, name, description, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            'test-user-001',
            'Unlimited Agency ' || i,
            'Agence test illimitee #' || i,
            NOW(),
            NOW()
        ) RETURNING id INTO agency_id;
        
        RAISE NOTICE 'Agence illimitee % creee : %', i, agency_id;
    END LOOP;
END $$;

-- Verifier le nouveau decompte
SELECT 
    'DECOMPTE AVEC PLAN ILLIMITE' as test_name,
    (SELECT COUNT(*) FROM agencies WHERE user_id = 'test-user-001') as total_agencies,
    sp.name as plan_actuel,
    CASE WHEN sp.max_agencies = -1 THEN 'Illimite' ELSE sp.max_agencies::text END as limite_agencies
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = 'test-user-001' AND us.status = 'active';

-- =============================================================================
-- 6. TESTS DES CONTRAINTES ET PROTECTIONS
-- =============================================================================

-- Test 7: Verifier qu'on ne peut pas avoir 2 abonnements actifs
DO $$
BEGIN
    -- Tenter de creer un second abonnement actif (doit echouer)
    INSERT INTO user_subscriptions (
        id, user_id, plan_id, start_date, end_date, status, created_at, updated_at
    ) VALUES (
        gen_random_uuid(),
        'test-user-001',
        (SELECT id FROM subscription_plans LIMIT 1),
        NOW(),
        NOW() + INTERVAL '1 month',
        'active',
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'ERREUR: Deux abonnements actifs crees (ne devrait pas arriver)';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'PROTECTION OK: Impossible de creer deux abonnements actifs - %', SQLERRM;
END $$;

-- =============================================================================
-- 7. RESUME DES TESTS
-- =============================================================================

SELECT 
    'RESUME FINAL DES TESTS' as test_name,
    
    -- Compter les plans
    (SELECT COUNT(*) FROM subscription_plans) as total_plans,
    (SELECT COUNT(*) FROM subscription_plans WHERE max_agencies = -1) as plans_agencies_illimitees,
    
    -- Verifier l'utilisateur test
    (SELECT COUNT(*) FROM user_subscriptions WHERE user_id = 'test-user-001') as abonnements_test_user,
    (SELECT COUNT(*) FROM agencies WHERE user_id = 'test-user-001') as agencies_test_user,
    
    -- Plan actuel
    (SELECT sp.name FROM user_subscriptions us 
     JOIN subscription_plans sp ON us.plan_id = sp.id 
     WHERE us.user_id = 'test-user-001' AND us.status = 'active') as plan_actuel_test_user;

-- =============================================================================
-- 8. NETTOYAGE (Optionnel - decommentez pour nettoyer)
-- =============================================================================

/*
-- Nettoyer les donnees de test
DELETE FROM agencies WHERE user_id = 'test-user-001';
DELETE FROM user_subscriptions WHERE user_id = 'test-user-001';
DELETE FROM profiles WHERE id = 'test-user-001';
DELETE FROM auth.users WHERE id = 'test-user-001';
DELETE FROM subscription_plans WHERE name = 'Test Unlimited Plan';

SELECT 'Nettoyage termine' as resultat;
*/

-- =============================================================================
-- INSTRUCTIONS D'UTILISATION
-- =============================================================================

SELECT '
TESTS TERMINES !

Pour executer ces tests :
1. Copiez tout le contenu de ce fichier
2. Executez dans votre client PostgreSQL/Supabase
3. Observez les messages NOTICE pour suivre les tests
4. Verifiez les resultats des SELECT

Pour nettoyer apres les tests :
- Decommentez la section NETTOYAGE a la fin
- Re-executez le script

Tests couverts :
- Creation et verification des plans
- Activation d''abonnements  
- Verification des limites
- Tests d''upgrade
- Plans avec limites illimitees
- Protection contre les doublons
- Comptage des ressources
' as instructions; 