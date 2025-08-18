-- Subscription payment methods (Mobile Money numbers per provider)
-- Stores the destination numbers customers should pay to when activating plans

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.subscription_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,                 -- Orange Money, Moov, Wave, etc.
  phone_number TEXT NOT NULL,             -- E.164 or local format
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  applicable_plans TEXT[] NULL,           -- list of subscription_plans.id; null = all plans
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Keep updated_at fresh
CREATE OR REPLACE FUNCTION public.subscription_pm_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_subscription_pm_updated_at ON public.subscription_payment_methods;
CREATE TRIGGER trg_subscription_pm_updated_at
BEFORE UPDATE ON public.subscription_payment_methods
FOR EACH ROW EXECUTE FUNCTION public.subscription_pm_set_updated_at();

-- RLS
ALTER TABLE public.subscription_payment_methods ENABLE ROW LEVEL SECURITY;

-- Read for authenticated users (pricing page needs to read)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'subscription_payment_methods' AND policyname = 'spm_select_authenticated'
  ) THEN
    CREATE POLICY spm_select_authenticated
    ON public.subscription_payment_methods
    FOR SELECT
    TO authenticated
    USING (is_active = true);
  END IF;
END$$;

-- Admin-only write access via admin_roles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'subscription_payment_methods' AND policyname = 'spm_write_admins'
  ) THEN
    CREATE POLICY spm_write_admins
    ON public.subscription_payment_methods
    FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM admin_roles 
        WHERE user_id = auth.uid() AND role_level IN ('admin','super_admin')
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM admin_roles 
        WHERE user_id = auth.uid() AND role_level IN ('admin','super_admin')
      )
    );
  END IF;
END$$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_spm_active_order ON public.subscription_payment_methods(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_spm_applicable_plans ON public.subscription_payment_methods USING GIN (applicable_plans);


