-- Vérifier pourquoi agenciesCount = 0 pour izoflores45@gmail.com

-- 1. Vérifier l'agence liée au profil
SELECT 'Agence dans le profil:' as section;
SELECT 
    p.id as profile_id,
    p.email,
    p.agency_id,
    a.id as agency_id_table,
    a.name as agency_name,
    a.user_id as agency_owner
FROM profiles p
LEFT JOIN agencies a ON p.agency_id = a.id
WHERE p.email = 'izoflores45@gmail.com';

-- 2. Vérifier toutes les agences appartenant à cet utilisateur
SELECT 'Agences appartenant à l''utilisateur:' as section;
SELECT 
    a.id,
    a.name,
    a.user_id,
    a.created_at,
    p.email as owner_email
FROM agencies a
LEFT JOIN profiles p ON a.user_id = p.id
WHERE a.user_id = '6a0e5fbb-7758-4143-9dcc-98e05ed0f27a';

-- 3. Compter les agences pour cet utilisateur (comme le fait le frontend)
SELECT 'Nombre d''agences:' as section;
SELECT COUNT(*) as agencies_count
FROM agencies 
WHERE user_id = '6a0e5fbb-7758-4143-9dcc-98e05ed0f27a';

-- 4. Si aucune agence trouvée, créer une agence basique
INSERT INTO agencies (
    id,
    name,
    user_id,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    'Agence de ' || COALESCE(p.first_name || ' ' || p.last_name, p.email),
    p.id,
    NOW(),
    NOW()
FROM profiles p
WHERE p.email = 'izoflores45@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM agencies 
    WHERE user_id = p.id
  );

-- 5. Vérifier le résultat final
SELECT 'Résultat final:' as section;
SELECT 
    a.id,
    a.name,
    a.user_id,
    p.email as owner_email,
    p.agency_id as profile_agency_id
FROM agencies a
LEFT JOIN profiles p ON a.user_id = p.id
WHERE a.user_id = '6a0e5fbb-7758-4143-9dcc-98e05ed0f27a';
