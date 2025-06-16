
-- Améliorer la table visitor_contacts avec des champs pour la gestion des sessions
ALTER TABLE visitor_contacts 
ADD COLUMN IF NOT EXISTS browser_fingerprint TEXT,
ADD COLUMN IF NOT EXISTS session_duration_days INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS auto_recognition_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_recognition_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS recognition_count INTEGER DEFAULT 0;

-- Créer une table pour gérer les sessions actives des visiteurs
CREATE TABLE IF NOT EXISTS visitor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_contact_id UUID REFERENCES visitor_contacts(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  browser_fingerprint TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  recognition_method TEXT DEFAULT 'manual', -- 'manual', 'email', 'phone', 'fingerprint', 'token'
  agency_id UUID REFERENCES agencies(id)
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_token ON visitor_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_fingerprint ON visitor_sessions(browser_fingerprint);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_visitor_contact ON visitor_sessions(visitor_contact_id);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_agency ON visitor_sessions(agency_id);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_expires ON visitor_sessions(expires_at);

-- Créer une table pour les statistiques de reconnaissance
CREATE TABLE IF NOT EXISTS visitor_recognition_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_contact_id UUID REFERENCES visitor_contacts(id) ON DELETE CASCADE,
  agency_id UUID REFERENCES agencies(id),
  recognition_date DATE DEFAULT CURRENT_DATE,
  recognition_method TEXT NOT NULL,
  time_since_last_visit INTERVAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Contrainte unique pour éviter les doublons par jour
  UNIQUE(visitor_contact_id, agency_id, recognition_date)
);

-- Index pour les statistiques
CREATE INDEX IF NOT EXISTS idx_visitor_recognition_stats_date ON visitor_recognition_stats(recognition_date);
CREATE INDEX IF NOT EXISTS idx_visitor_recognition_stats_agency ON visitor_recognition_stats(agency_id);

-- Fonction pour nettoyer automatiquement les sessions expirées
CREATE OR REPLACE FUNCTION cleanup_expired_visitor_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Marquer les sessions expirées comme inactives
  UPDATE visitor_sessions 
  SET is_active = false 
  WHERE expires_at < now() AND is_active = true;
  
  -- Supprimer les sessions expirées depuis plus de 7 jours
  DELETE FROM visitor_sessions 
  WHERE expires_at < now() - INTERVAL '7 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

-- Fonction pour créer une nouvelle session visiteur
CREATE OR REPLACE FUNCTION create_visitor_session(
  p_visitor_contact_id UUID,
  p_agency_id UUID,
  p_browser_fingerprint TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_duration_days INTEGER DEFAULT 30,
  p_recognition_method TEXT DEFAULT 'manual'
)
RETURNS TABLE (
  session_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_session_token TEXT;
  v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Générer un token unique
  v_session_token := encode(gen_random_bytes(32), 'base64');
  v_expires_at := now() + (p_duration_days || ' days')::INTERVAL;
  
  -- Désactiver les anciennes sessions pour ce visiteur et cette agence
  UPDATE visitor_sessions 
  SET is_active = false 
  WHERE visitor_contact_id = p_visitor_contact_id 
    AND agency_id = p_agency_id 
    AND is_active = true;
  
  -- Créer la nouvelle session
  INSERT INTO visitor_sessions (
    visitor_contact_id,
    session_token,
    browser_fingerprint,
    ip_address,
    user_agent,
    expires_at,
    recognition_method,
    agency_id
  ) VALUES (
    p_visitor_contact_id,
    v_session_token,
    p_browser_fingerprint,
    p_ip_address,
    p_user_agent,
    v_expires_at,
    p_recognition_method,
    p_agency_id
  );
  
  -- Mettre à jour les statistiques du visiteur
  UPDATE visitor_contacts 
  SET 
    last_recognition_at = now(),
    recognition_count = recognition_count + 1,
    browser_fingerprint = COALESCE(p_browser_fingerprint, browser_fingerprint)
  WHERE id = p_visitor_contact_id;
  
  RETURN QUERY SELECT v_session_token, v_expires_at;
END;
$$;

-- Fonction pour reconnaître un visiteur existant (CORRIGÉE)
CREATE OR REPLACE FUNCTION recognize_returning_visitor(
  p_email TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_browser_fingerprint TEXT DEFAULT NULL,
  p_session_token TEXT DEFAULT NULL,
  p_agency_id UUID DEFAULT NULL
)
RETURNS TABLE (
  visitor_contact_id UUID,
  recognition_method TEXT,
  session_valid BOOLEAN,
  days_since_last_visit INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_visitor_contact_id UUID;
  v_session_id UUID;
  v_recognition_method TEXT := 'none';
  v_session_valid BOOLEAN := false;
  v_days_since INTEGER;
  v_last_seen_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- 1. Vérifier par token de session (priorité la plus haute)
  IF p_session_token IS NOT NULL THEN
    SELECT vs.visitor_contact_id, vs.id, vc.last_seen_at 
    INTO v_visitor_contact_id, v_session_id, v_last_seen_at
    FROM visitor_sessions vs
    JOIN visitor_contacts vc ON vs.visitor_contact_id = vc.id
    WHERE vs.session_token = p_session_token 
      AND vs.is_active = true 
      AND vs.expires_at > now()
      AND (p_agency_id IS NULL OR vs.agency_id = p_agency_id);
      
    IF FOUND THEN
      v_recognition_method := 'token';
      v_session_valid := true;
      
      -- Mettre à jour l'activité de la session
      UPDATE visitor_sessions 
      SET last_activity_at = now() 
      WHERE id = v_session_id;
    END IF;
  END IF;
  
  -- 2. Si pas trouvé par token, chercher par email
  IF v_recognition_method = 'none' AND p_email IS NOT NULL THEN
    SELECT id, last_seen_at 
    INTO v_visitor_contact_id, v_last_seen_at
    FROM visitor_contacts 
    WHERE email = p_email 
      AND (p_agency_id IS NULL OR agency_id = p_agency_id)
      AND auto_recognition_enabled = true
    ORDER BY last_seen_at DESC 
    LIMIT 1;
    
    IF FOUND THEN
      v_recognition_method := 'email';
    END IF;
  END IF;
  
  -- 3. Si pas trouvé par email, chercher par téléphone
  IF v_recognition_method = 'none' AND p_phone IS NOT NULL THEN
    SELECT id, last_seen_at 
    INTO v_visitor_contact_id, v_last_seen_at
    FROM visitor_contacts 
    WHERE phone = p_phone 
      AND (p_agency_id IS NULL OR agency_id = p_agency_id)
      AND auto_recognition_enabled = true
    ORDER BY last_seen_at DESC 
    LIMIT 1;
    
    IF FOUND THEN
      v_recognition_method := 'phone';
    END IF;
  END IF;
  
  -- 4. Si pas trouvé par contact, chercher par fingerprint (moins fiable)
  IF v_recognition_method = 'none' AND p_browser_fingerprint IS NOT NULL THEN
    SELECT id, last_seen_at 
    INTO v_visitor_contact_id, v_last_seen_at
    FROM visitor_contacts 
    WHERE browser_fingerprint = p_browser_fingerprint 
      AND (p_agency_id IS NULL OR agency_id = p_agency_id)
      AND auto_recognition_enabled = true
      AND last_seen_at > now() - INTERVAL '7 days' -- Seulement récent pour le fingerprint
    ORDER BY last_seen_at DESC 
    LIMIT 1;
    
    IF FOUND THEN
      v_recognition_method := 'fingerprint';
    END IF;
  END IF;
  
  -- Si un visiteur a été trouvé, calculer les jours depuis la dernière visite
  IF v_visitor_contact_id IS NOT NULL THEN
    v_days_since := EXTRACT(DAY FROM (now() - v_last_seen_at));
    
    -- Enregistrer la statistique de reconnaissance si c'est une nouvelle reconnaissance
    IF v_recognition_method != 'token' THEN
      INSERT INTO visitor_recognition_stats (
        visitor_contact_id,
        agency_id,
        recognition_method,
        time_since_last_visit
      ) VALUES (
        v_visitor_contact_id,
        p_agency_id,
        v_recognition_method,
        (now() - v_last_seen_at)
      ) ON CONFLICT (visitor_contact_id, agency_id, recognition_date) DO NOTHING;
    END IF;
  END IF;
  
  RETURN QUERY SELECT 
    v_visitor_contact_id,
    v_recognition_method,
    v_session_valid,
    v_days_since;
END;
$$;
