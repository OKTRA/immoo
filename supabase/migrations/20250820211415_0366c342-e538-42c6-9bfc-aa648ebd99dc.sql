-- CORRECTION DES PROBLÈMES DE SÉCURITÉ
-- Mise à jour des fonctions avec search_path sécurisé
-- =================================================================

-- 1. Corriger la fonction update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- 2. Corriger la fonction get_current_user_role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
SET search_path = public
AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- 3. Corriger la fonction is_admin_user
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
SET search_path = public
AS $$
    SELECT EXISTS(
        SELECT 1 FROM public.admin_roles 
        WHERE user_id = auth.uid() AND is_active = true
    );
$$;

-- Message de confirmation
SELECT 'Problèmes de sécurité corrigés avec succès!' as message;