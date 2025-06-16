-- Script pour déboguer pourquoi izoflores45@gmail.com n'apparaît pas

-- 1. Vérifier l'utilisateur dans auth.users
SELECT 'Utilisateur dans auth.users:' as section;
SELECT id, email, email_confirmed_at, created_at, raw_user_meta_data
FROM auth.users 
WHERE email = 'izoflores45@gmail.com';

-- 2. Vérifier s'il y a un profil correspondant
SELECT 'Profil dans profiles:' as section;
SELECT id, email, first_name, last_name, role, agency_id, created_at
FROM profiles 
WHERE email = 'izoflores45@gmail.com';

-- 3. Vérifier tous les profils existants
SELECT 'Tous les profils:' as section;
SELECT id, email, first_name, last_name, role, agency_id, created_at
FROM profiles 
ORDER BY created_at DESC
LIMIT 5;

-- 4. Créer le profil manquant s'il n'existe pas
INSERT INTO profiles (id, email, first_name, last_name, role, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'first_name', split_part(au.email, '@', 1)),
    COALESCE(au.raw_user_meta_data->>'last_name', ''),
    COALESCE(au.raw_user_meta_data->>'role', 'agency'),
    au.created_at,
    NOW()
FROM auth.users au
WHERE au.email = 'izoflores45@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = au.id
  );

-- 5. Vérifier le résultat
SELECT 'Profil après création:' as section;
SELECT id, email, first_name, last_name, role, agency_id, created_at
FROM profiles 
WHERE email = 'izoflores45@gmail.com';
