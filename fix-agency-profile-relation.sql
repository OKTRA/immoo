-- =============================================================================
-- CORRIGER LA RELATION PROFILE-AGENCY ET PERMETTRE SUPPRESSION
-- =============================================================================

-- 1. Vérifier l'état actuel de la relation
SELECT 
    '🔍 DIAGNOSTIC INITIAL' as section,
    'Contrainte problématique: profiles_agency_id_fkey' as probleme,
    'Solution: Modifier la contrainte pour CASCADE/SET NULL' as solution;

-- Vérifier les contraintes actuelles
SELECT 
    'Contraintes actuelles:' as type,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule,
    rc.update_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'profiles'
  AND kcu.column_name = 'agency_id';

-- 2. Vérifier l'utilisateur problématique
SELECT 
    '👤 UTILISATEUR PROBLÉMATIQUE' as section,
    p.id,
    p.email,
    p.first_name,
    p.last_name,
    p.agency_id,
    a.name as agency_name,
    a.user_id as agency_owner_id,
    CASE 
        WHEN p.agency_id IS NOT NULL AND a.user_id IS NOT NULL THEN 'LIAISON BIDIRECTIONNELLE'
        WHEN p.agency_id IS NOT NULL THEN 'PROFIL→AGENCE SEULEMENT'
        WHEN a.user_id IS NOT NULL THEN 'AGENCE→PROFIL SEULEMENT'
        ELSE 'AUCUNE LIAISON'
    END as statut_liaison
FROM profiles p
LEFT JOIN agencies a ON p.agency_id = a.id
WHERE p.email = 'izoflores45@gmail.com';

-- 3. Supprimer l'ancienne contrainte problématique
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_agency_id_fkey;

-- 4. Recréer la contrainte avec SET NULL (plus sûr pour suppression)
ALTER TABLE profiles 
ADD CONSTRAINT profiles_agency_id_fkey 
FOREIGN KEY (agency_id) REFERENCES agencies(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- 5. Créer la relation bidirectionnelle correcte
-- Assurer que l'agence appartient bien à l'utilisateur (user_id)
UPDATE agencies 
SET 
    user_id = (SELECT id FROM profiles WHERE email = 'izoflores45@gmail.com'),
    updated_at = NOW()
WHERE id = '341e5578-5494-4ed1-b91e-36cfb2c35c27';

-- Assurer que l'utilisateur est lié à son agence (agency_id)
UPDATE profiles 
SET 
    agency_id = '341e5578-5494-4ed1-b91e-36cfb2c35c27',
    updated_at = NOW()
WHERE email = 'izoflores45@gmail.com';

-- 6. Vérifier la correction
SELECT 
    '✅ APRÈS CORRECTION' as section,
    p.id,
    p.email,
    p.agency_id,
    a.name as agency_name,
    a.user_id as agency_owner_id,
    CASE 
        WHEN p.agency_id = a.id AND a.user_id = p.id THEN '✅ LIAISON BIDIRECTIONNELLE OK'
        WHEN p.agency_id = a.id THEN '⚠️ PROFIL→AGENCE SEULEMENT'
        WHEN a.user_id = p.id THEN '⚠️ AGENCE→PROFIL SEULEMENT'
        ELSE '❌ AUCUNE LIAISON'
    END as statut_liaison
FROM profiles p
LEFT JOIN agencies a ON p.agency_id = a.id OR a.user_id = p.id
WHERE p.email = 'izoflores45@gmail.com';

-- 7. Test de suppression (simulation)
SELECT 
    '🧪 TEST SIMULATION SUPPRESSION' as section,
    'Avec la nouvelle contrainte SET NULL:' as info_1,
    'Si on supprime l''agence → profiles.agency_id sera mis à NULL' as info_2,
    'L''utilisateur ne sera plus lié mais ne bloquera plus la suppression' as info_3;

-- Vérifier la nouvelle contrainte
SELECT 
    'Nouvelle contrainte:' as type,
    tc.constraint_name,
    rc.delete_rule as 'action_suppression',
    rc.update_rule as 'action_modification'
FROM information_schema.table_constraints AS tc 
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'profiles'
  AND tc.constraint_name = 'profiles_agency_id_fkey';

-- 8. Instructions pour la suppression d'agence
SELECT 
    '📋 INSTRUCTIONS SUPPRESSION AGENCE' as section,
    'Maintenant vous pouvez supprimer l''agence sans erreur:' as instruction_1,
    'DELETE FROM agencies WHERE id = ''341e5578-5494-4ed1-b91e-36cfb2c35c27'';' as instruction_2,
    'Le profiles.agency_id sera automatiquement mis à NULL' as instruction_3,
    'Aucune contrainte de clé étrangère ne bloquera la suppression' as instruction_4;

-- 9. Bonus: Fonction pour une suppression propre d'agence
CREATE OR REPLACE FUNCTION delete_agency_safely(agency_uuid UUID)
RETURNS JSON AS $$
DECLARE
    agency_name TEXT;
    affected_profiles INT;
    result JSON;
BEGIN
    -- Récupérer le nom de l'agence
    SELECT name INTO agency_name FROM agencies WHERE id = agency_uuid;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'message', 'Agence non trouvée');
    END IF;
    
    -- Compter les profils qui vont être affectés
    SELECT COUNT(*) INTO affected_profiles FROM profiles WHERE agency_id = agency_uuid;
    
    -- Supprimer l'agence (les profils seront automatiquement mis à jour avec SET NULL)
    DELETE FROM agencies WHERE id = agency_uuid;
    
    -- Retourner le résultat
    result := json_build_object(
        'success', true,
        'message', format('Agence "%s" supprimée avec succès', agency_name),
        'affected_profiles', affected_profiles,
        'note', 'Les profils utilisateur ont été automatiquement déliés'
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 10. Message final
SELECT 
    '🎉 PROBLÈME RÉSOLU' as message,
    'La contrainte profiles_agency_id_fkey a été modifiée' as detail_1,
    'Action lors de suppression agence: SET NULL (sûr)' as detail_2,
    'La relation bidirectionnelle est établie' as detail_3,
    'Vous pouvez maintenant supprimer l''agence sans erreur' as detail_4; 