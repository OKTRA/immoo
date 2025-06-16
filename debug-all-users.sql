-- Vérifier tous les utilisateurs qui devraient apparaître dans l'admin panel

-- 1. Tous les profils avec leur classification
SELECT 'Tous les profils avec classification:' as section;
SELECT 
    p.id,
    p.email,
    p.first_name,
    p.last_name,
    p.role,
    p.agency_id,
    p.created_at,
    a.name as agency_name,
    ar.user_id as is_admin,
    CASE 
        WHEN ar.user_id IS NOT NULL THEN 'admin'
        WHEN p.agency_id IS NOT NULL THEN 'agency'
        ELSE 'proprietaire'
    END as user_type_calculated
FROM profiles p
LEFT JOIN agencies a ON p.agency_id = a.id
LEFT JOIN admin_roles ar ON ar.user_id = p.id
ORDER BY p.created_at DESC;

-- 2. Comptage par type
SELECT 'Comptage par type:' as section;
SELECT 
    CASE 
        WHEN ar.user_id IS NOT NULL THEN 'admin'
        WHEN p.agency_id IS NOT NULL THEN 'agency'
        ELSE 'proprietaire'
    END as user_type,
    COUNT(*) as count
FROM profiles p
LEFT JOIN admin_roles ar ON ar.user_id = p.id
GROUP BY 
    CASE 
        WHEN ar.user_id IS NOT NULL THEN 'admin'
        WHEN p.agency_id IS NOT NULL THEN 'agency'
        ELSE 'proprietaire'
    END;

-- 3. Vérifier spécifiquement izoflores45@gmail.com
SELECT 'Détails izoflores45@gmail.com:' as section;
SELECT 
    p.id,
    p.email,
    p.first_name,
    p.last_name,
    p.role,
    p.agency_id,
    a.name as agency_name,
    ar.user_id as admin_role_exists,
    CASE 
        WHEN ar.user_id IS NOT NULL THEN 'admin'
        WHEN p.agency_id IS NOT NULL THEN 'agency'
        ELSE 'proprietaire'
    END as user_type_should_be
FROM profiles p
LEFT JOIN agencies a ON p.agency_id = a.id
LEFT JOIN admin_roles ar ON ar.user_id = p.id
WHERE p.email = 'izoflores45@gmail.com';
