-- Fonction pour vérifier la limite des propriétés
CREATE OR REPLACE FUNCTION check_property_limit()
RETURNS trigger AS $$
DECLARE
  max_allowed INT;
  current_count INT;
BEGIN
  -- Obtenir la limite de propriétés depuis l'abonnement
  SELECT max_properties INTO max_allowed
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = auth.uid()
  AND us.status = 'active';
  
  -- Si aucun abonnement trouvé, utiliser la limite du plan gratuit (1)
  max_allowed := COALESCE(max_allowed, 1);
  
  -- Compter les propriétés actives actuelles
  SELECT COUNT(*) INTO current_count
  FROM properties
  WHERE owner_id = auth.uid()
  AND is_active = true;
  
  -- Si c'est une mise à jour d'une propriété existante sans changement d'état actif
  IF TG_OP = 'UPDATE' AND OLD.id = NEW.id AND OLD.is_active = NEW.is_active THEN
    RETURN NEW;
  END IF;
  
  -- Vérifier si l'ajout/activation dépasserait la limite
  IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NOT OLD.is_active AND NEW.is_active)) 
     AND current_count >= max_allowed THEN
    RAISE EXCEPTION 'Limite de % propriétés atteinte avec votre abonnement actuel', max_allowed
    USING HINT = 'Veuillez mettre à niveau votre abonnement pour ajouter plus de propriétés';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier la limite des baux
CREATE OR REPLACE FUNCTION check_lease_limit()
RETURNS trigger AS $$
DECLARE
  max_allowed INT;
  current_count INT;
BEGIN
  -- Obtenir la limite de baux depuis l'abonnement
  SELECT max_leases INTO max_allowed
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = auth.uid()
  AND us.status = 'active';
  
  -- Si aucun abonnement trouvé, utiliser la limite du plan gratuit (2)
  max_allowed := COALESCE(max_allowed, 2);
  
  -- Compter les baux actifs actuels
  SELECT COUNT(*) INTO current_count
  FROM leases
  WHERE owner_id = auth.uid()
  AND is_active = true;
  
  -- Si c'est une mise à jour d'un bail existant sans changement d'état actif
  IF TG_OP = 'UPDATE' AND OLD.id = NEW.id AND OLD.is_active = NEW.is_active THEN
    RETURN NEW;
  END IF;
  
  -- Vérifier si l'ajout/activation dépasserait la limite
  IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NOT OLD.is_active AND NEW.is_active)) 
     AND current_count >= max_allowed THEN
    RAISE EXCEPTION 'Limite de % baux atteinte avec votre abonnement actuel', max_allowed
    USING HINT = 'Veuillez mettre à niveau votre abonnement pour ajouter plus de baux';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer les déclencheurs pour les propriétés
DROP TRIGGER IF EXISTS check_property_limit_trigger ON properties;
CREATE TRIGGER check_property_limit_trigger
BEFORE INSERT OR UPDATE ON properties
FOR EACH ROW
EXECUTE FUNCTION check_property_limit();

-- Créer les déclencheurs pour les baux
DROP TRIGGER IF EXISTS check_lease_limit_trigger ON leases;
CREATE TRIGGER check_lease_limit_trigger
BEFORE INSERT OR UPDATE ON leases
FOR EACH ROW
EXECUTE FUNCTION check_lease_limit();

-- Politiques pour les propriétés
CREATE POLICY "Users can only view their own properties"
ON properties FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Users can only insert their own properties"
ON properties FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can only update their own properties"
ON properties FOR UPDATE
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Politiques pour les baux
CREATE POLICY "Users can only view their own leases"
ON leases FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Users can only insert their own leases"
ON leases FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can only update their own leases"
ON leases FOR UPDATE
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Activer les déclencheurs de vérification d'abonnement pour les propriétés et les baux
CREATE TRIGGER check_subscription_before_insert_properties
BEFORE INSERT ON properties
FOR EACH ROW
EXECUTE FUNCTION check_subscription_status();

CREATE TRIGGER check_subscription_before_update_properties
BEFORE UPDATE ON properties
FOR EACH ROW
EXECUTE FUNCTION check_subscription_status();

CREATE TRIGGER check_subscription_before_insert_leases
BEFORE INSERT ON leases
FOR EACH ROW
EXECUTE FUNCTION check_subscription_status();

CREATE TRIGGER check_subscription_before_update_leases
BEFORE UPDATE ON leases
FOR EACH ROW
EXECUTE FUNCTION check_subscription_status();

-- Mettre à jour la fonction check_subscription_status pour gérer les cas où il n'y a pas d'abonnement
CREATE OR REPLACE FUNCTION check_subscription_status()
RETURNS TRIGGER AS $$
DECLARE
  sub_status TEXT;
  is_free_plan BOOLEAN;
BEGIN
  -- Vérifier si l'utilisateur a un abonnement actif
  SELECT status, sp.is_free INTO sub_status, is_free_plan
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = auth.uid()
  ORDER BY us.created_at DESC
  LIMIT 1;
  
  -- Autoriser si l'utilisateur a un abonnement actif, est admin, ou s'il n'a pas d'abonnement (plan gratuit par défaut)
  IF sub_status = 'active' OR 
     auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'super_admin') OR
     sub_status IS NULL OR
     is_free_plan = true THEN
    RETURN NEW;
  ELSE
    RAISE EXCEPTION 'Abonnement inactif ou expiré. Veuillez renouveler votre abonnement.';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
