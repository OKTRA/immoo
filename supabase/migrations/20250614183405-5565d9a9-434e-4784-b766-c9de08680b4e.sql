
-- Ajouter les nouvelles colonnes pour la gestion des agences
ALTER TABLE agencies 
ADD COLUMN is_blocked boolean DEFAULT false,
ADD COLUMN hidden_from_index boolean DEFAULT false,
ADD COLUMN blocked_reason text,
ADD COLUMN blocked_at timestamp with time zone;

-- Créer un index pour améliorer les performances des requêtes filtrées
CREATE INDEX idx_agencies_is_blocked ON agencies(is_blocked);
CREATE INDEX idx_agencies_hidden_from_index ON agencies(hidden_from_index);
