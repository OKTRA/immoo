
-- Créer une table pour les visiteurs qui veulent accéder aux informations de contact des agences
CREATE TABLE public.visitor_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  phone TEXT,
  first_name TEXT,
  last_name TEXT,
  purpose TEXT, -- 'contact_agency', 'property_inquiry', etc.
  agency_id UUID REFERENCES public.agencies(id),
  property_id UUID REFERENCES public.properties(id), -- optionnel si c'est pour une propriété spécifique
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  CONSTRAINT visitor_contacts_email_or_phone_check CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- Index pour optimiser les recherches
CREATE INDEX visitor_contacts_email_idx ON public.visitor_contacts(email);
CREATE INDEX visitor_contacts_phone_idx ON public.visitor_contacts(phone);
CREATE INDEX visitor_contacts_agency_id_idx ON public.visitor_contacts(agency_id);
CREATE INDEX visitor_contacts_created_at_idx ON public.visitor_contacts(created_at);

-- Activer RLS
ALTER TABLE public.visitor_contacts ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre l'insertion (pour les nouveaux visiteurs)
CREATE POLICY "Allow insert for visitors" 
ON public.visitor_contacts 
FOR INSERT 
WITH CHECK (true);

-- Politique pour permettre la lecture et mise à jour par email/téléphone
CREATE POLICY "Allow select and update by contact info" 
ON public.visitor_contacts 
FOR ALL 
USING (true);

-- Créer une table pour suivre les accès aux informations de contact
CREATE TABLE public.agency_contact_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_contact_id UUID REFERENCES public.visitor_contacts(id),
  agency_id UUID REFERENCES public.agencies(id),
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  access_type TEXT DEFAULT 'contact_view' -- 'contact_view', 'property_inquiry', etc.
);

-- Index pour les logs d'accès
CREATE INDEX agency_contact_access_logs_visitor_idx ON public.agency_contact_access_logs(visitor_contact_id);
CREATE INDEX agency_contact_access_logs_agency_idx ON public.agency_contact_access_logs(agency_id);
