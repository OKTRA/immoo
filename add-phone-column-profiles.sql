-- Script pour ajouter la colonne 'phone' manquante à la table 'profiles'

-- 1. Ajouter la colonne phone si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'phone'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE profiles 
        ADD COLUMN phone TEXT;
        
        RAISE NOTICE 'Colonne phone ajoutée à la table profiles';
    ELSE
        RAISE NOTICE 'Colonne phone existe déjà dans la table profiles';
    END IF;
END $$;

-- 2. Vérifier la structure finale de la table profiles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position; 