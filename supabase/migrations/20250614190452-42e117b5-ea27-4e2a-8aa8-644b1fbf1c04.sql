
-- Supprimer les index créés pour les colonnes de blocage
DROP INDEX IF EXISTS idx_agencies_is_blocked;
DROP INDEX IF EXISTS idx_agencies_hidden_from_index;

-- Supprimer les colonnes de gestion des agences bloquées
ALTER TABLE agencies 
DROP COLUMN IF EXISTS is_blocked,
DROP COLUMN IF EXISTS hidden_from_index,
DROP COLUMN IF EXISTS blocked_reason,
DROP COLUMN IF EXISTS blocked_at;
