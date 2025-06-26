-- =============================================================================
-- DIAGNOSTIC ET CORRECTION DES LIAISONS AGENCE-UTILISATEUR
-- Résout le problème des agences non affichées après inscription
-- =============================================================================

-- === DIAGNOSTIC DES LIAISONS AGENCE-UTILISATEUR ===

-- 1. DIAGNOSTIC: Voir les utilisateurs agence sans agence liée
SELECT 'UTILISATEURS AGENCE SANS AGENCE LIEE:' as section;
SELECT 
    p.id as user_id,
    p.email,
    p.first_name,
    p.last_name,
    p.agency_id
FROM profiles p
WHERE p.role = 'agency' 
AND p.agency_id IS NULL;

-- 2. DIAGNOSTIC: Voir les agences sans utilisateur lié
SELECT 'AGENCES SANS UTILISATEUR LIE:' as section;
SELECT 
    a.id as agency_id,
    a.name,
    a.email,
    a.user_id
FROM agencies a
WHERE a.user_id IS NULL;

-- 3. DIAGNOSTIC: Voir les correspondances par email
SELECT 'CORRESPONDANCES PAR EMAIL:' as section;
SELECT 
    p.id as user_id,
    p.email as user_email,
    a.id as agency_id,
    a.name as agency_name,
    a.email as agency_email
FROM profiles p
JOIN agencies a ON p.email = a.email
WHERE p.role = 'agency'
AND (p.agency_id IS NULL OR a.user_id IS NULL);

-- =============================================================================
-- CORRECTIONS
-- =============================================================================

-- Corriger les agences orphelines
UPDATE agencies 
SET 
    user_id = (
        SELECT p.id 
        FROM profiles p 
        WHERE p.email = agencies.email 
        AND p.role = 'agency'
    ),
    updated_at = NOW()
WHERE user_id IS NULL
AND email IN (
    SELECT email 
    FROM profiles 
    WHERE role = 'agency'
);

-- Corriger les profils utilisateur
UPDATE profiles 
SET 
    agency_id = (
        SELECT a.id 
        FROM agencies a 
        WHERE a.email = profiles.email 
        AND a.user_id = profiles.id
    ),
    updated_at = NOW()
WHERE role = 'agency'
AND agency_id IS NULL;

-- Créer des agences manquantes
INSERT INTO agencies (
    id,
    name,
    email,
    description,
    user_id,
    status,
    is_visible,
    properties_count,
    rating,
    verified,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid() as id,
    COALESCE(p.first_name || ' ' || p.last_name || ' Agency', 
             SPLIT_PART(p.email, '@', 1) || ' Agency') as name,
    p.email,
    'Agence créée automatiquement' as description,
    p.id as user_id,
    'active' as status,
    true as is_visible,
    0 as properties_count,
    0.0 as rating,
    false as verified,
    NOW() as created_at,
    NOW() as updated_at
FROM profiles p
WHERE p.role = 'agency'
AND p.agency_id IS NULL
AND NOT EXISTS (
    SELECT 1 FROM agencies a WHERE a.email = p.email
);

-- Mettre à jour les profils avec les nouvelles agences
UPDATE profiles 
SET 
    agency_id = (
        SELECT a.id 
        FROM agencies a 
        WHERE a.email = profiles.email 
        AND a.user_id = profiles.id
    ),
    updated_at = NOW()
WHERE role = 'agency'
AND agency_id IS NULL;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

SELECT 'VERIFICATION FINALE:' as section;
SELECT 
    p.id as user_id,
    p.email,
    p.agency_id,
    a.id as agency_id_linked,
    a.name as agency_name,
    CASE 
        WHEN p.agency_id = a.id AND a.user_id = p.id THEN 'OK'
        ELSE 'PROBLEME'
    END as status
FROM profiles p
LEFT JOIN agencies a ON p.email = a.email
WHERE p.role = 'agency'
ORDER BY p.email;

-- Statistiques finales
SELECT 'STATISTIQUES: Résumé final' as stats_section;

SELECT 
    'Utilisateurs agence' as type,
    COUNT(*) as total,
    COUNT(CASE WHEN p.agency_id IS NOT NULL THEN 1 END) as avec_agence,
    COUNT(CASE WHEN p.agency_id IS NULL THEN 1 END) as sans_agence
FROM profiles p
WHERE p.role = 'agency';

SELECT 
    'Agences' as type,
    COUNT(*) as total,
    COUNT(CASE WHEN a.user_id IS NOT NULL THEN 1 END) as avec_utilisateur,
    COUNT(CASE WHEN a.user_id IS NULL THEN 1 END) as sans_utilisateur
FROM agencies a;

SELECT 'FIN: Correction des liaisons agence-utilisateur terminée!' as fin; 