-- CORRECTION CRITIQUE DES LIMITES D'ABONNEMENT
-- Ce script corrige TOUS les problèmes identifiés dans le système de limites

-- =============================================================================
-- 1. CORRIGER LES TRIGGERS POSTGRESQL
-- =============================================================================

-- Supprimer les anciens triggers incorrects
DROP TRIGGER IF EXISTS check_property_limit_trigger ON properties;
DROP TRIGGER IF EXISTS check_lease_limit_trigger ON leases;
DROP FUNCTION IF EXISTS check_property_limit();
DROP FUNCTION IF EXISTS check_lease_limit();

-- Fonction CORRECTE pour vérifier les limites de propriétés
CREATE OR REPLACE FUNCTION check_property_limit()
RETURNS trigger AS $$
DECLARE
  max_allowed INT;
  current_count INT;
  user_agency_ids UUID[];
BEGIN
  -- Obtenir les IDs des agences de l'utilisateur connecté
  SELECT ARRAY(
    SELECT a.id FROM agencies a 
    WHERE a.user_id = auth.uid()
  ) INTO user_agency_ids;
  
  -- Obtenir la limite de propriétés depuis l'abonnement ACTIF (dernier en date)
  SELECT sp.max_properties INTO max_allowed
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = auth.uid()
  AND us.status = 'active'
  ORDER BY us.created_at DESC
  LIMIT 1;

  -- Si aucun abonnement actif trouvé, charger la limite depuis le plan 'Gratuit' par ID canonique
  IF max_allowed IS NULL THEN
    SELECT max_properties INTO max_allowed
    FROM subscription_plans
    WHERE id = '00000000-0000-0000-0000-000000000001'::uuid
    LIMIT 1;
  END IF;

  -- Si toujours NULL, bloquer explicitement (aucun plan disponible)
  IF max_allowed IS NULL THEN
    RAISE EXCEPTION 'Aucun plan défini. Veuillez contacter l''administrateur.'
    USING HINT = 'Aucun plan d''abonnement actif ni plan "Gratuit" trouvé';
  END IF;
  
  -- Si limite illimitée (-1), autoriser
  IF max_allowed = -1 THEN
    RETURN NEW;
  END IF;
  
  -- Compter les propriétés actuelles des agences de l'utilisateur
  SELECT COUNT(*) INTO current_count
  FROM properties p
  WHERE p.agency_id = ANY(user_agency_ids);
  
  -- Si c'est une mise à jour d'une propriété existante, ne pas la compter
  IF TG_OP = 'UPDATE' AND OLD.id = NEW.id THEN
    current_count := current_count - 1;
  END IF;
  
  -- Vérifier si l'ajout dépasserait la limite
  IF TG_OP = 'INSERT' AND current_count >= max_allowed THEN
    RAISE EXCEPTION 'Limite de % propriétés atteinte avec votre abonnement actuel. Vous en avez déjà %/%', 
      max_allowed, current_count, max_allowed
    USING HINT = 'Veuillez mettre à niveau votre abonnement pour ajouter plus de propriétés';
  END IF;
  
  -- Vérifier que la propriété appartient bien à une agence de l'utilisateur
  IF NOT (NEW.agency_id = ANY(user_agency_ids)) THEN
    RAISE EXCEPTION 'Vous ne pouvez pas créer de propriété pour cette agence'
    USING HINT = 'La propriété doit appartenir à une de vos agences';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction CORRECTE pour vérifier les limites de baux
CREATE OR REPLACE FUNCTION check_lease_limit()
RETURNS trigger AS $$
DECLARE
  max_allowed INT;
  current_count INT;
  user_property_ids UUID[];
BEGIN
  -- Obtenir les IDs des propriétés des agences de l'utilisateur connecté
  SELECT ARRAY(
    SELECT p.id FROM properties p 
    JOIN agencies a ON p.agency_id = a.id
    WHERE a.user_id = auth.uid()
  ) INTO user_property_ids;
  
  -- Obtenir la limite de baux depuis l'abonnement ACTIF (dernier en date)
  SELECT sp.max_leases INTO max_allowed
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = auth.uid()
  AND us.status = 'active'
  ORDER BY us.created_at DESC
  LIMIT 1;

  -- Si aucun abonnement actif trouvé, charger la limite depuis le plan 'Gratuit' par ID canonique
  IF max_allowed IS NULL THEN
    SELECT max_leases INTO max_allowed
    FROM subscription_plans
    WHERE id = '00000000-0000-0000-0000-000000000001'::uuid
    LIMIT 1;
  END IF;

  -- Si toujours NULL, bloquer explicitement (aucun plan disponible)
  IF max_allowed IS NULL THEN
    RAISE EXCEPTION 'Aucun plan défini. Veuillez contacter l''administrateur.'
    USING HINT = 'Aucun plan d''abonnement actif ni plan "Gratuit" trouvé';
  END IF;
  
  -- Si limite illimitée (-1), autoriser
  IF max_allowed = -1 THEN
    RETURN NEW;
  END IF;
  
  -- Compter les baux actifs actuels des propriétés de l'utilisateur
  SELECT COUNT(*) INTO current_count
  FROM leases l
  WHERE l.property_id = ANY(user_property_ids)
  AND l.is_active = true;
  
  -- Si c'est une mise à jour d'un bail existant, ne pas le compter
  IF TG_OP = 'UPDATE' AND OLD.id = NEW.id AND OLD.is_active = true THEN
    current_count := current_count - 1;
  END IF;
  
  -- Vérifier si l'ajout dépasserait la limite
  IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.is_active = true)) 
     AND current_count >= max_allowed THEN
    RAISE EXCEPTION 'Limite de % baux atteinte avec votre abonnement actuel. Vous en avez déjà %/%', 
      max_allowed, current_count, max_allowed
    USING HINT = 'Veuillez mettre à niveau votre abonnement pour ajouter plus de baux';
  END IF;
  
  -- Vérifier que le bail concerne bien une propriété de l'utilisateur
  IF NOT (NEW.property_id = ANY(user_property_ids)) THEN
    RAISE EXCEPTION 'Vous ne pouvez pas créer de bail pour cette propriété'
    USING HINT = 'Le bail doit concerner une de vos propriétés';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer les nouveaux triggers CORRECTS
CREATE TRIGGER check_property_limit_trigger
BEFORE INSERT OR UPDATE ON properties
FOR EACH ROW
EXECUTE FUNCTION check_property_limit();

CREATE TRIGGER check_lease_limit_trigger
BEFORE INSERT OR UPDATE ON leases
FOR EACH ROW
EXECUTE FUNCTION check_lease_limit();

-- =============================================================================
-- 2. CORRIGER LES POLITIQUES RLS
-- =============================================================================

-- Supprimer les anciennes politiques incorrectes
DROP POLICY IF EXISTS "Users can only view their own properties" ON properties;
DROP POLICY IF EXISTS "Users can only insert their own properties" ON properties;
DROP POLICY IF EXISTS "Users can only update their own properties" ON properties;
DROP POLICY IF EXISTS "Users can only view their own leases" ON leases;
DROP POLICY IF EXISTS "Users can only insert their own leases" ON leases;
DROP POLICY IF EXISTS "Users can only update their own leases" ON leases;

-- Supprimer les politiques existantes portant les nouveaux noms, pour permettre la ré-exécution idempotente
DROP POLICY IF EXISTS "Users can only view properties from their agencies" ON properties;
DROP POLICY IF EXISTS "Users can only insert properties to their agencies" ON properties;
DROP POLICY IF EXISTS "Users can only update properties from their agencies" ON properties;
DROP POLICY IF EXISTS "Users can only view leases for their properties" ON leases;
DROP POLICY IF EXISTS "Users can only insert leases for their properties" ON leases;
DROP POLICY IF EXISTS "Users can only update leases for their properties" ON leases;

-- Politiques CORRECTES pour les propriétés
CREATE POLICY "Users can only view properties from their agencies"
ON properties FOR SELECT
USING (agency_id IN (SELECT id FROM agencies WHERE user_id = auth.uid()));

CREATE POLICY "Users can only insert properties to their agencies"
ON properties FOR INSERT
WITH CHECK (agency_id IN (SELECT id FROM agencies WHERE user_id = auth.uid()));

CREATE POLICY "Users can only update properties from their agencies"
ON properties FOR UPDATE
USING (agency_id IN (SELECT id FROM agencies WHERE user_id = auth.uid()))
WITH CHECK (agency_id IN (SELECT id FROM agencies WHERE user_id = auth.uid()));

-- Politiques CORRECTES pour les baux
CREATE POLICY "Users can only view leases for their properties"
ON leases FOR SELECT
USING (property_id IN (
  SELECT p.id FROM properties p 
  JOIN agencies a ON p.agency_id = a.id 
  WHERE a.user_id = auth.uid()
));

CREATE POLICY "Users can only insert leases for their properties"
ON leases FOR INSERT
WITH CHECK (property_id IN (
  SELECT p.id FROM properties p 
  JOIN agencies a ON p.agency_id = a.id 
  WHERE a.user_id = auth.uid()
));

CREATE POLICY "Users can only update leases for their properties"
ON leases FOR UPDATE
USING (property_id IN (
  SELECT p.id FROM properties p 
  JOIN agencies a ON p.agency_id = a.id 
  WHERE a.user_id = auth.uid()
))
WITH CHECK (property_id IN (
  SELECT p.id FROM properties p 
  JOIN agencies a ON p.agency_id = a.id 
  WHERE a.user_id = auth.uid()
));

-- =============================================================================
-- 3. FONCTION DE VÉRIFICATION POUR LES SERVICES
-- =============================================================================

-- Fonction pour obtenir le nombre de ressources d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_resource_count(
  user_id_param UUID,
  resource_type TEXT,
  agency_id_param UUID DEFAULT NULL
) RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  count_result INTEGER := 0;
BEGIN
  CASE resource_type
    WHEN 'agencies' THEN
      SELECT COUNT(*) INTO count_result
      FROM agencies
      WHERE user_id = user_id_param;
      
    WHEN 'properties' THEN
      IF agency_id_param IS NOT NULL THEN
        SELECT COUNT(*) INTO count_result
        FROM properties
        WHERE agency_id = agency_id_param;
      ELSE
        SELECT COUNT(*) INTO count_result
        FROM properties p
        JOIN agencies a ON p.agency_id = a.id
        WHERE a.user_id = user_id_param;
      END IF;
      
    WHEN 'leases' THEN
      IF agency_id_param IS NOT NULL THEN
        SELECT COUNT(*) INTO count_result
        FROM leases l
        JOIN properties p ON l.property_id = p.id
        WHERE p.agency_id = agency_id_param
        AND l.is_active = true;
      ELSE
        SELECT COUNT(*) INTO count_result
        FROM leases l
        JOIN properties p ON l.property_id = p.id
        JOIN agencies a ON p.agency_id = a.id
        WHERE a.user_id = user_id_param
        AND l.is_active = true;
      END IF;
      
    ELSE
      count_result := 0;
  END CASE;
  
  RETURN count_result;
END;
$$;

-- =============================================================================
-- 4. VÉRIFICATIONS FINALES
-- =============================================================================

-- Vérifier que les triggers sont bien créés
SELECT 
  'TRIGGERS CRÉÉS' as verification,
  COUNT(*) as nb_triggers
FROM information_schema.triggers 
WHERE trigger_name IN ('check_property_limit_trigger', 'check_lease_limit_trigger');

-- Vérifier que les politiques sont bien créées
SELECT 
  'POLITIQUES CRÉÉES' as verification,
  COUNT(*) as nb_policies
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('properties', 'leases');

SELECT 'CORRECTION DES LIMITES TERMINÉE ✅' as resultat; 