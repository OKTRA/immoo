-- Créer l'agence manquante pour izoflores45@gmail.com

-- 1. Vérifier d'abord les données utilisateur
SELECT 'Données utilisateur avant:' as section;
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    agency_id
FROM profiles 
WHERE id = '6a0e5fbb-7758-4143-9dcc-98e05ed0f27a';

-- 2. Créer l'agence avec uniquement les colonnes qui existent
INSERT INTO agencies (
    id,
    name,
    email,
    description,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    COALESCE(
        (SELECT CONCAT(first_name, ' ', last_name, ' Agency') 
         FROM profiles WHERE id = '6a0e5fbb-7758-4143-9dcc-98e05ed0f27a'),
        'izoflores45 Agency'
    ),
    'izoflores45@gmail.com',
    'Agence créée automatiquement lors de la correction du compte',
    NOW(),
    NOW()
);

-- 3. Lier l'utilisateur à l'agence créée
UPDATE profiles 
SET 
    agency_id = (SELECT id FROM agencies WHERE email = 'izoflores45@gmail.com'),
    updated_at = NOW()
WHERE id = '6a0e5fbb-7758-4143-9dcc-98e05ed0f27a';

-- 4. Vérifier le résultat
SELECT 'Données utilisateur après:' as section;
SELECT 
    p.id,
    p.email,
    p.first_name,
    p.last_name,
    p.role,
    p.agency_id,
    a.name as agency_name,
    a.email as agency_email
FROM profiles p
LEFT JOIN agencies a ON p.agency_id = a.id
WHERE p.id = '6a0e5fbb-7758-4143-9dcc-98e05ed0f27a';

-- 5. Vérifier l'agence créée
SELECT 'Agence créée:' as section;
SELECT 
    id,
    name,
    email,
    created_at
FROM agencies 
WHERE email = 'izoflores45@gmail.com';
