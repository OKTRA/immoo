-- Fix: Remove exposed view over auth.users
-- Context: Linter 0002_auth_users_exposed flagged a view that exposes auth.users via PostgREST (public schema)
-- Safe change: No frontend usage of public.users detected; dropping avoids leaking auth data

BEGIN;
  -- Drop the risky view if it exists
  DROP VIEW IF EXISTS public.users CASCADE;
COMMIT;