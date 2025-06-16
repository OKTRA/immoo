-- Vérifier si la table billing_history existe
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'billing_history'
ORDER BY ordinal_position;

-- Si la table n'existe pas, lister toutes les tables liées aux paiements
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND (table_name LIKE '%billing%' OR table_name LIKE '%payment%' OR table_name LIKE '%subscription%');
