-- CORRECTION D'URGENCE : Supprimer la politique récursive et désactiver RLS temporairement

-- 1. Supprimer TOUTES les politiques sur profiles pour arrêter la récursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- 2. Temporairement DÉSACTIVER RLS sur profiles pour que l'admin panel fonctionne
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 3. Vérifier que RLS est désactivé
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';

-- 4. Test rapide pour vérifier que ça marche
SELECT 'Test après correction d''urgence:' as section;
SELECT COUNT(*) as total_profiles FROM profiles;
