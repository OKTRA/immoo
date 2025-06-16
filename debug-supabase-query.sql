-- Déboguer la requête Supabase qui échoue

-- 1. Vérifier la structure des tables
SELECT 'Structure table profiles:' as section;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

SELECT 'Structure table agencies:' as section;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'agencies' 
ORDER BY ordinal_position;

-- 2. Vérifier les foreign keys
SELECT 'Foreign keys profiles -> agencies:' as section;
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'profiles';

-- 3. Tester la requête problématique manuellement
SELECT 'Test requête avec JOIN:' as section;
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

-- 4. Vérifier toutes les agences
SELECT 'Toutes les agences:' as section;
SELECT id, name, created_at
FROM agencies
ORDER BY created_at DESC
LIMIT 10;

-- 5. Vérifier l'agency_id de notre utilisateur
SELECT 'Agency ID de notre utilisateur:' as section;
SELECT 
    p.agency_id,
    EXISTS(SELECT 1 FROM agencies WHERE id = p.agency_id) as agency_exists
FROM profiles p
WHERE p.id = '6a0e5fbb-7758-4143-9dcc-98e05ed0f27a';
