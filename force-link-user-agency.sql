-- Forcer la liaison entre l'utilisateur et l'agence créée

-- 1. Vérifier l'état actuel
SELECT 'État actuel du profil:' as section;
SELECT id, email, first_name, last_name, role, agency_id 
FROM profiles 
WHERE id = '6a0e5fbb-7758-4143-9dcc-98e05ed0f27a';

-- 2. Vérifier l'agence créée
SELECT 'Agence disponible:' as section;
SELECT id, name, email 
FROM agencies 
WHERE email = 'izoflores45@gmail.com';

-- 3. Mettre à jour le profil pour le lier à l'agence
UPDATE profiles 
SET 
    agency_id = (SELECT id FROM agencies WHERE email = 'izoflores45@gmail.com' LIMIT 1),
    updated_at = NOW()
WHERE id = '6a0e5fbb-7758-4143-9dcc-98e05ed0f27a';

-- 4. Vérifier que la mise à jour a fonctionné
SELECT 'Profil après mise à jour:' as section;
SELECT 
    p.id,
    p.email,
    p.first_name,
    p.last_name,
    p.role,
    p.agency_id,
    a.name as agency_name,
    CASE 
        WHEN p.agency_id IS NOT NULL THEN 'agency'
        ELSE 'proprietaire'
    END as user_type_calculated
FROM profiles p
LEFT JOIN agencies a ON p.agency_id = a.id
WHERE p.id = '6a0e5fbb-7758-4143-9dcc-98e05ed0f27a';
