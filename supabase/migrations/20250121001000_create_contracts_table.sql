CREATE TABLE contracts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- ex: 'bail', 'cloture', 'autre'
    title TEXT,
    parties JSONB, -- { "locataire": {...}, "agence": {...}, ... }
    details JSONB, -- infos spécifiques au contrat
    content TEXT, -- texte généré du contrat
    status TEXT DEFAULT 'draft', -- draft, validated, closed
    related_entity UUID, -- ex: id du bail si applicable
    jurisdiction TEXT, -- pays ou région dont la législation s’applique
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
); 