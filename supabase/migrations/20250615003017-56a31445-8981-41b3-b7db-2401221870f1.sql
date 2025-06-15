
-- Ajouter les colonnes manquantes à la table agencies
ALTER TABLE agencies 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- Mettre à jour les valeurs existantes si nécessaire
UPDATE agencies 
SET status = 'active' 
WHERE status IS NULL;

UPDATE agencies 
SET is_visible = true 
WHERE is_visible IS NULL;
