-- Vérifier les politiques RLS sur la table profiles

-- 1. Vérifier si RLS est activé sur profiles
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';

-- 2. Lister toutes les politiques sur profiles
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 3. Tester la requête directement avec l'utilisateur actuel
SELECT 'Test direct de la requête profiles:' as section;
SELECT id, email, first_name, last_name, role, agency_id, created_at
FROM profiles
ORDER BY created_at DESC;

-- 4. Vérifier les rôles et permissions de l'utilisateur connecté
SELECT 'Utilisateur connecté:' as section;
SELECT current_user, current_role;
