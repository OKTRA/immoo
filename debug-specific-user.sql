-- Script pour déboguer pourquoi l'utilisateur spécifique n'apparaît pas

-- 1. Vérifier le profil spécifique
SELECT 'Profil izoflores45:' as section;
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    created_at,
    agency_id,
    updated_at
FROM profiles 
WHERE id = '6a0e5fbb-7758-4143-9dcc-98e05ed0f27a' OR email = 'izoflores45@gmail.com';

-- 2. Vérifier s'il a une agence associée
SELECT 'Agence associée:' as section;
SELECT 
    p.id,
    p.email,
    p.agency_id,
    a.name as agency_name,
    a.id as agency_full_id
FROM profiles p
LEFT JOIN agencies a ON p.agency_id = a.id
WHERE p.id = '6a0e5fbb-7758-4143-9dcc-98e05ed0f27a';

-- 3. Vérifier s'il a un rôle admin
SELECT 'Rôle admin:' as section;
SELECT 
    ar.user_id,
    ar.role_level,
    ar.created_at
FROM admin_roles ar
WHERE ar.user_id = '6a0e5fbb-7758-4143-9dcc-98e05ed0f27a';

-- 4. Tester la requête exacte du useUsersManagement
SELECT 'Test requête exacte:' as section;
SELECT 
    p.id,
    p.email,
    p.first_name,
    p.last_name,
    p.role,
    p.created_at,
    p.agency_id,
    a.name as agency_name
FROM profiles p
LEFT JOIN agencies a ON p.agency_id = a.id
WHERE p.id = '6a0e5fbb-7758-4143-9dcc-98e05ed0f27a';

-- 5. Vérifier s'il y a des problèmes avec les données
SELECT 'Vérification données:' as section;
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    created_at,
    agency_id,
    CASE 
        WHEN first_name IS NULL THEN 'first_name NULL'
        WHEN first_name = '' THEN 'first_name EMPTY'
        ELSE 'first_name OK'
    END as first_name_status,
    CASE 
        WHEN last_name IS NULL THEN 'last_name NULL'
        WHEN last_name = '' THEN 'last_name EMPTY'
        ELSE 'last_name OK'
    END as last_name_status,
    CASE 
        WHEN email IS NULL THEN 'email NULL'
        WHEN email = '' THEN 'email EMPTY'
        ELSE 'email OK'
    END as email_status
FROM profiles 
WHERE id = '6a0e5fbb-7758-4143-9dcc-98e05ed0f27a';

-- 6. Comparer avec d'autres profils pour voir la différence
SELECT 'Comparaison avec autres profils:' as section;
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    created_at,
    agency_id
FROM profiles 
ORDER BY created_at DESC
LIMIT 5;
