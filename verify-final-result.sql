-- Vérifier le résultat final après création de l'agence

-- 1. Vérifier que l'utilisateur est maintenant lié à son agence
SELECT 'Profil utilisateur final:' as section;
SELECT 
    p.id,
    p.email,
    p.first_name,
    p.last_name,
    p.role,
    p.agency_id,
    a.name as agency_name,
    a.email as agency_email,
    a.id as agency_full_id
FROM profiles p
LEFT JOIN agencies a ON p.agency_id = a.id
WHERE p.id = '6a0e5fbb-7758-4143-9dcc-98e05ed0f27a';

-- 2. Vérifier le type d'utilisateur selon la logique du code
SELECT 'Classification utilisateur:' as section;
SELECT 
    p.id,
    p.email,
    p.role,
    p.agency_id,
    CASE 
        WHEN EXISTS(SELECT 1 FROM admin_roles ar WHERE ar.user_id = p.id) THEN 'admin'
        WHEN p.agency_id IS NOT NULL THEN 'agency'
        ELSE 'proprietaire'
    END as user_type_calculated
FROM profiles p
WHERE p.id = '6a0e5fbb-7758-4143-9dcc-98e05ed0f27a';

-- 3. Vérifier qu'il n'y a pas de doublons d'agence
SELECT 'Agences pour cet email:' as section;
SELECT id, name, email, created_at
FROM agencies 
WHERE email = 'izoflores45@gmail.com'
ORDER BY created_at;
