-- Muana Pay: transactions table + policies + indexes
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  fingerprint TEXT UNIQUE,
  payment_reference TEXT,
  amount_cents INTEGER,
  currency TEXT DEFAULT 'FCFA',
  counterparty_number TEXT,
  parsed_confidence NUMERIC,
  parsed_at TIMESTAMPTZ,

  matched_payment_transaction_id UUID,
  matched_status VARCHAR(20),
  matched_at TIMESTAMPTZ
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'transactions' AND policyname = 'transactions_select_all'
  ) THEN
    CREATE POLICY "transactions_select_all" ON public.transactions
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'transactions' AND policyname = 'transactions_insert_all'
  ) THEN
    CREATE POLICY "transactions_insert_all" ON public.transactions
      FOR INSERT WITH CHECK (true);
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON public.transactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_sender ON public.transactions(sender);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_reference ON public.transactions(payment_reference);
CREATE INDEX IF NOT EXISTS idx_transactions_matched_status ON public.transactions(matched_status);
CREATE INDEX IF NOT EXISTS idx_transactions_matched_ptid ON public.transactions(matched_payment_transaction_id);


