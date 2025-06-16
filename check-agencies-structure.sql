-- Vérifier la structure de la table agencies
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'agencies' 
ORDER BY ordinal_position;
