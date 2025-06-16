-- Enable RLS on relevant tables if not already enabled
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;

-- Policies for agencies
CREATE OR REPLACE FUNCTION check_agency_limit()
RETURNS trigger AS $$
DECLARE
  max_allowed INT;
  current_count INT;
BEGIN
  -- Get user's agency limit from subscription
  SELECT max_agencies INTO max_allowed
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = auth.uid()
  AND us.status = 'active';
  
  -- If no subscription found, use free tier limit (1)
  max_allowed := COALESCE(max_allowed, 1);
  
  -- Count current active agencies
  SELECT COUNT(*) INTO current_count
  FROM agencies
  WHERE owner_id = auth.uid()
  AND is_active = true;
  
  -- If this is an update to an existing agency, don't count it against the limit
  IF TG_OP = 'UPDATE' AND OLD.id = NEW.id AND OLD.is_active = NEW.is_active THEN
    RETURN NEW;
  END IF;
  
  -- Check if adding/activating would exceed the limit
  IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NOT OLD.is_active AND NEW.is_active)) 
     AND current_count >= max_allowed THEN
    RAISE EXCEPTION 'Limite de % agences atteinte avec votre abonnement actuel', max_allowed
    USING HINT = 'Veuillez mettre à niveau votre abonnement pour ajouter plus d''agences';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for agencies
DROP TRIGGER IF EXISTS check_agency_limit_trigger ON agencies;
CREATE TRIGGER check_agency_limit_trigger
BEFORE INSERT OR UPDATE ON agencies
FOR EACH ROW
EXECUTE FUNCTION check_agency_limit();

-- Similar functions and triggers for properties and leases...

-- Policies to ensure users can only modify their own resources
CREATE POLICY "Users can only view their own agencies"
ON agencies FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Users can only insert their own agencies"
ON agencies FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can only update their own agencies"
ON agencies FOR UPDATE
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Similar policies for properties and leases...

-- Function to check subscription status before allowing operations
CREATE OR REPLACE FUNCTION check_subscription_status()
RETURNS TRIGGER AS $$
DECLARE
  sub_status TEXT;
BEGIN
  -- Check if user has an active subscription
  SELECT status INTO sub_status
  FROM user_subscriptions
  WHERE user_id = auth.uid()
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Allow if user has an active subscription or is a super admin
  IF sub_status = 'active' OR auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'super_admin') THEN
    RETURN NEW;
  ELSE
    RAISE EXCEPTION 'Abonnement inactif ou expiré. Veuillez renouveler votre abonnement.';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to relevant tables
CREATE TRIGGER check_subscription_before_insert
BEFORE INSERT ON agencies
FOR EACH ROW
EXECUTE FUNCTION check_subscription_status();

-- Similar triggers for other tables...
