-- =============================================================================
-- TEST COMPLET DES PLANS D'ABONNEMENT - VERSION CORRIGEE POUR SUPABASE
-- =============================================================================

-- Variables globales pour le test
DO $$
DECLARE
    test_user_id uuid := 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid;
    test_email text := 'test@plan-verification.com';
    test_plan_id uuid;
    agency_id1 uuid;
    agency_id2 uuid;
    plan_max_agencies int;
    premium_plan_id uuid;
BEGIN
    RAISE NOTICE 'Debut des tests avec utilisateur ID: %', test_user_id;

-- =============================================================================
-- 1. PREPARATION : Nettoyer les donnees de test existantes
-- =============================================================================

    -- Nettoyer les donnees de test precedentes
    DELETE FROM user_subscriptions WHERE user_id = test_user_id;
    DELETE FROM agencies WHERE user_id = test_user_id;
    DELETE FROM profiles WHERE id = test_user_id;
    DELETE FROM subscription_plans WHERE name LIKE 'Test %';
    
    RAISE NOTICE 'Donnees de test precedentes nettoyees';

-- =============================================================================
-- 2. CREATION D'UN UTILISATEUR DE TEST
-- =============================================================================

    -- Creer le profil utilisateur directement (sans auth.users car RLS)
    INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
    VALUES (
        test_user_id,
        test_email,
        'Test User Plans',
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        updated_at = NOW();

    RAISE NOTICE 'Profil utilisateur de test cree: %', test_user_id;

-- =============================================================================
-- 3. VERIFICATION DES PLANS EXISTANTS
-- =============================================================================

    RAISE NOTICE '=== PLANS EXISTANTS ===';
    
    -- Afficher les plans disponibles
    FOR test_plan_id IN 
        SELECT id FROM subscription_plans WHERE is_active = true ORDER BY price
    LOOP
        RAISE NOTICE 'Plan ID: % - Details dans la requete suivante', test_plan_id;
    END LOOP;

-- =============================================================================
-- 4. TEST D'ACTIVATION D'ABONNEMENT
-- =============================================================================

    -- Recuperer le premier plan disponible (le moins cher)
    SELECT id INTO test_plan_id 
    FROM subscription_plans 
    WHERE is_active = true 
    ORDER BY price ASC 
    LIMIT 1;

    IF test_plan_id IS NOT NULL THEN
        RAISE NOTICE 'Test activation avec plan ID: %', test_plan_id;
        
        -- Utiliser la fonction RPC pour activer l'abonnement
        PERFORM activate_subscription_with_promo(
            test_user_id,
            test_plan_id::text,
            NULL
        );
        
        RAISE NOTICE 'Abonnement active avec succes';
    ELSE
        RAISE NOTICE 'ERREUR: Aucun plan actif trouve';
        RETURN;
    END IF;

-- =============================================================================
-- 5. TESTS DES LIMITES D'AGENCES
-- =============================================================================

    -- Recuperer la limite d'agences du plan actuel
    SELECT sp.max_agencies INTO plan_max_agencies
    FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = test_user_id AND us.status = 'active';

    RAISE NOTICE 'Limite agences du plan actuel: %', 
        CASE WHEN plan_max_agencies = -1 THEN 'ILLIMITE' ELSE plan_max_agencies::text END;

    -- Test creation premiere agence
    INSERT INTO agencies (id, user_id, name, description, phone, email, address, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        test_user_id,
        'Test Agency 1',
        'Premiere agence de test',
        '+223 70 00 00 00',
        test_email,
        'Test Address 1, Bamako, Mali',
        NOW(),
        NOW()
    ) RETURNING id INTO agency_id1;

    RAISE NOTICE 'Agence 1 creee avec succes: %', agency_id1;

    -- Test creation deuxieme agence (peut echouer selon le plan)
    BEGIN
        INSERT INTO agencies (id, user_id, name, description, phone, email, address, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            test_user_id,
            'Test Agency 2', 
            'Deuxieme agence de test',
            '+223 70 00 00 01',
            'test2@plan-verification.com',
            'Test Address 2, Bamako, Mali',
            NOW(),
            NOW()
        ) RETURNING id INTO agency_id2;
        
        RAISE NOTICE 'Agence 2 creee avec succes: %', agency_id2;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Agence 2 NON creee - Limite atteinte ou erreur: %', SQLERRM;
    END;

-- =============================================================================
-- 6. TEST D'UPGRADE VERS PLAN PREMIUM
-- =============================================================================

    -- Chercher un plan avec plus de limites
    SELECT id INTO premium_plan_id
    FROM subscription_plans 
    WHERE is_active = true 
    AND (max_agencies > plan_max_agencies OR max_agencies = -1)
    AND id != test_plan_id
    ORDER BY price DESC 
    LIMIT 1;

    IF premium_plan_id IS NOT NULL THEN
        RAISE NOTICE 'Test upgrade vers plan premium: %', premium_plan_id;
        
        -- Effectuer l'upgrade
        PERFORM activate_subscription_with_promo(
            test_user_id,
            premium_plan_id::text,
            NULL
        );
        
        RAISE NOTICE 'Upgrade effectue avec succes';
        
        -- Tester creation d'agences supplementaires apres upgrade
        BEGIN
            INSERT INTO agencies (id, user_id, name, description, phone, email, address, created_at, updated_at)
            VALUES (
                gen_random_uuid(),
                test_user_id,
                'Test Agency Premium',
                'Agence creee apres upgrade',
                '+223 70 00 00 02',
                'premium@plan-verification.com',
                'Premium Address, Bamako, Mali',
                NOW(),
                NOW()
            );
            
            RAISE NOTICE 'Agence premium creee avec succes apres upgrade';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Agence premium NON creee: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'Aucun plan premium trouve pour upgrade';
    END IF;

-- =============================================================================
-- 7. TEST DE CREATION DE PLAN ILLIMITE
-- =============================================================================

    -- Creer un plan de test avec limites illimitees
    INSERT INTO subscription_plans (
        id, name, description, price, billing_cycle,
        max_agencies, max_properties, max_leases, max_users,
        is_active, created_at, updated_at
    ) VALUES (
        gen_random_uuid(),
        'Test Unlimited Plan',
        'Plan de test avec toutes les limites illimitees',
        999.99,
        'monthly',
        -1, -1, -1, -1,  -- Tout illimite
        true,
        NOW(),
        NOW()
    ) RETURNING id INTO premium_plan_id;

    RAISE NOTICE 'Plan illimite cree: %', premium_plan_id;

    -- Activer le plan illimite
    PERFORM activate_subscription_with_promo(
        test_user_id,
        premium_plan_id::text,
        NULL
    );

    RAISE NOTICE 'Plan illimite active';

    -- Test creation multiple d'agences avec plan illimite
    FOR i IN 1..3 LOOP
        BEGIN
            INSERT INTO agencies (id, user_id, name, description, phone, email, address, created_at, updated_at)
            VALUES (
                gen_random_uuid(),
                test_user_id,
                'Unlimited Agency ' || i,
                'Agence illimitee numero ' || i,
                '+223 70 00 0' || (10 + i),
                'unlimited' || i || '@test.com',
                'Unlimited Address ' || i,
                NOW(),
                NOW()
            );
            
            RAISE NOTICE 'Agence illimitee % creee', i;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erreur creation agence illimitee %: %', i, SQLERRM;
        END;
    END LOOP;

-- =============================================================================
-- 8. VERIFICATION FINALE
-- =============================================================================

    RAISE NOTICE '=== VERIFICATION FINALE ===';
    RAISE NOTICE 'Nombre total d''agences creees: %', 
        (SELECT COUNT(*) FROM agencies WHERE user_id = test_user_id);
    
    RAISE NOTICE 'Nombre d''abonnements: %',
        (SELECT COUNT(*) FROM user_subscriptions WHERE user_id = test_user_id);

-- =============================================================================
-- 9. NETTOYAGE OPTIONNEL
-- =============================================================================

    RAISE NOTICE '=== NETTOYAGE EN COURS ===';
    
    -- Nettoyer les donnees de test
    DELETE FROM agencies WHERE user_id = test_user_id;
    DELETE FROM user_subscriptions WHERE user_id = test_user_id;
    DELETE FROM profiles WHERE id = test_user_id;
    DELETE FROM subscription_plans WHERE name LIKE 'Test %';
    
    RAISE NOTICE 'Nettoyage termine - Donnees de test supprimees';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERREUR GENERALE dans le test: %', SQLERRM;
    RAISE NOTICE 'DETAIL: %', SQLSTATE;
END $$;

-- =============================================================================
-- REQUETES DE VERIFICATION SEPAREES (a executer apres le bloc principal)
-- =============================================================================

-- Verification des plans disponibles
SELECT 
    'PLANS DISPONIBLES' as section,
    name,
    price,
    CASE WHEN max_agencies = -1 THEN 'Illimite' ELSE max_agencies::text END as max_agencies,
    CASE WHEN max_properties = -1 THEN 'Illimite' ELSE max_properties::text END as max_properties,
    CASE WHEN max_leases = -1 THEN 'Illimite' ELSE max_leases::text END as max_leases,
    CASE WHEN max_users = -1 THEN 'Illimite' ELSE max_users::text END as max_users,
    is_active
FROM subscription_plans 
WHERE is_active = true
ORDER BY price;

-- Verification de la fonction activate_subscription_with_promo
SELECT 
    'FONCTION RPC DISPONIBLE' as section,
    p.proname as nom_fonction,
    pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'activate_subscription_with_promo'
  AND n.nspname = 'public';

-- Test de comptage simple
SELECT 
    'COMPTAGE ACTUEL' as section,
    (SELECT COUNT(*) FROM subscription_plans WHERE is_active = true) as plans_actifs,
    (SELECT COUNT(*) FROM user_subscriptions) as total_abonnements,
    (SELECT COUNT(*) FROM agencies) as total_agences;

-- Instructions finales
SELECT '
=== TESTS TERMINES ===

Ce script a teste :
1. Creation d''utilisateur de test
2. Activation d''abonnements via RPC
3. Test des limites d''agences
4. Upgrade de plans
5. Plans avec limites illimitees
6. Nettoyage automatique

Si aucune erreur n''est apparue, le systeme fonctionne correctement !

Pour tester manuellement :
1. Connectez-vous a l''interface web
2. Creez des agences jusqu''a la limite
3. Testez l''upgrade de plan
4. Verifiez les compteurs en temps reel
' as instructions; 