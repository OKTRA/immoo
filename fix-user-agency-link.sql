-- =============================================================================
-- CORRIGER LA LIAISON UTILISATEUR-AGENCE POUR izoflores45@gmail.com
-- =============================================================================

-- 1. Verification de l'etat actuel
SELECT 'ETAT ACTUEL' as section;

-- Verifier l'utilisateur
SELECT 
    'Utilisateur:' as type,
    id,
    email,
    first_name,
    last_name,
    role,
    agency_id
FROM profiles 
WHERE email = 'izoflores45@gmail.com';

-- Verifier l'agence
SELECT 
    'Agence:' as type,
    id,
    name,
    email,
    user_id,
    created_at
FROM agencies 
WHERE id = '341e5578-5494-4ed1-b91e-36cfb2c35c27';

-- =============================================================================
-- 2. CORRIGER LA LIAISON
-- =============================================================================

-- Option A: Lier l'agence a l'utilisateur via user_id dans agencies
UPDATE agencies 
SET 
    user_id = (SELECT id FROM profiles WHERE email = 'izoflores45@gmail.com'),
    updated_at = NOW()
WHERE id = '341e5578-5494-4ed1-b91e-36cfb2c35c27';

-- Option B: Lier l'utilisateur a l'agence via agency_id dans profiles
UPDATE profiles 
SET 
    agency_id = '341e5578-5494-4ed1-b91e-36cfb2c35c27',
    updated_at = NOW()
WHERE email = 'izoflores45@gmail.com';

-- =============================================================================
-- 3. VERIFICATION APRES CORRECTION
-- =============================================================================

SELECT 'APRES CORRECTION' as section;

-- Verifier la liaison bidirectionnelle
SELECT 
    'Verification finale:' as type,
    p.id as profile_id,
    p.email,
    p.first_name,
    p.last_name,
    p.role,
    p.agency_id,
    a.id as agency_id_table,
    a.name as agency_name,
    a.user_id as agency_owner_id,
    CASE 
        WHEN p.agency_id = a.id AND a.user_id = p.id THEN 'LIAISON OK'
        WHEN p.agency_id = a.id THEN 'LIAISON PARTIELLE (profile->agency)'
        WHEN a.user_id = p.id THEN 'LIAISON PARTIELLE (agency->profile)'
        ELSE 'AUCUNE LIAISON'
    END as statut_liaison
FROM profiles p
FULL OUTER JOIN agencies a ON (p.agency_id = a.id OR a.user_id = p.id)
WHERE p.email = 'izoflores45@gmail.com' 
   OR a.id = '341e5578-5494-4ed1-b91e-36cfb2c35c27';

-- Test de la requete getUserAgencies (simulation)
SELECT 
    'Test getUserAgencies:' as type,
    a.id,
    a.name,
    a.email as agency_email,
    a.user_id,
    p.email as owner_email
FROM agencies a
JOIN profiles p ON a.user_id = p.id
WHERE p.email = 'izoflores45@gmail.com';

-- =============================================================================
-- 4. S'ASSURER QU'IL Y A UN ABONNEMENT
-- =============================================================================

-- Verifier l'abonnement de l'utilisateur
SELECT 
    'Abonnement:' as type,
    us.user_id,
    sp.name as plan_name,
    us.status,
    us.start_date,
    us.end_date
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = (SELECT id FROM profiles WHERE email = 'izoflores45@gmail.com')
  AND us.status = 'active';

-- Creer un abonnement gratuit si inexistant
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
    p.id,
    (SELECT id FROM subscription_plans WHERE name ILIKE '%gratuit%' OR name ILIKE '%free%' LIMIT 1),
    'active',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 year',
    'free',
    false
FROM profiles p
WHERE p.email = 'izoflores45@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM user_subscriptions 
    WHERE user_id = p.id AND status = 'active'
  );

-- =============================================================================
-- 5. VERIFICATION FINALE COMPLETE
-- =============================================================================

SELECT 'VERIFICATION COMPLETE' as section;

SELECT 
    'Tout OK:' as type,
    p.email,
    p.role,
    a.name as agency_name,
    sp.name as plan_name,
    us.status as subscription_status,
    CASE 
        WHEN p.agency_id IS NOT NULL AND a.user_id IS NOT NULL AND us.status = 'active' 
        THEN 'CONFIGURATION COMPLETE'
        ELSE 'PROBLEME RESTANT'
    END as statut_final
FROM profiles p
LEFT JOIN agencies a ON p.agency_id = a.id AND a.user_id = p.id
LEFT JOIN user_subscriptions us ON us.user_id = p.id AND us.status = 'active'
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE p.email = 'izoflores45@gmail.com';

SELECT '
=== CORRECTION TERMINEE ===

Ce script a :
1. Lie l''agence 341e5578-5494-4ed1-b91e-36cfb2c35c27 a l''utilisateur izoflores45@gmail.com
2. Cree un abonnement gratuit si necessaire
3. Verifie que tout fonctionne

L''agence devrait maintenant apparaitre dans l''interface utilisateur.
' as instructions; 