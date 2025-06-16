-- Corriger les politiques RLS sur la table profiles pour permettre aux admins de voir tous les profils

-- 1. Vérifier les politiques actuelles
SELECT 'Politiques RLS actuelles sur profiles:' as section;
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- 2. Créer/Mettre à jour la politique pour permettre aux admins de voir tous les profils
-- D'abord, supprimer la politique existante si elle existe
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Créer une nouvelle politique pour les admins
CREATE POLICY "Admins can view all profiles" ON profiles
FOR SELECT 
TO authenticated
USING (
  -- Permettre aux admins de voir tous les profils
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE admin_roles.user_id = auth.uid()
  )
  OR
  -- Permettre aux utilisateurs de voir leur propre profil
  auth.uid() = id
);

-- 3. Vérifier que la politique a été créée
SELECT 'Nouvelles politiques RLS:' as section;
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- 4. Tester l'accès (à exécuter depuis l'interface admin pour voir si ça marche)
SELECT 'Test après correction:' as section;
SELECT COUNT(*) as total_profiles FROM profiles;
