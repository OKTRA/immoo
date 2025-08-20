-- MIGRATION COMPLÈTE POUR RESTAURER LA BASE DE DONNÉES IMMOO
-- =================================================================

-- 1. TABLES PRINCIPALES
-- =================================================================

-- Table des profils utilisateurs
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'proprietaire' CHECK (role IN ('proprietaire', 'agency', 'admin')),
    agency_id UUID,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des agences
CREATE TABLE public.agencies (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    website_url TEXT,
    address TEXT,
    city TEXT,
    country TEXT DEFAULT 'Côte d''Ivoire',
    owner_id UUID,
    user_id UUID,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    is_visible BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    properties_count INTEGER DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des plans d'abonnement
CREATE TABLE public.subscription_plans (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'XOF',
    max_agencies INTEGER NOT NULL DEFAULT 1,
    max_properties INTEGER NOT NULL DEFAULT 10,
    max_photos_per_property INTEGER DEFAULT 10,
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des abonnements utilisateurs
CREATE TABLE public.user_subscriptions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
    agency_id UUID,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
    payment_method TEXT,
    transaction_id TEXT,
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des propriétés
CREATE TABLE public.properties (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('appartement', 'maison', 'terrain', 'bureau', 'commerce', 'villa')),
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('vente', 'location')),
    price DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'XOF',
    surface DECIMAL(8,2),
    bedrooms INTEGER,
    bathrooms INTEGER,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    district TEXT,
    country TEXT DEFAULT 'Côte d''Ivoire',
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    images TEXT[] DEFAULT '{}',
    features JSONB DEFAULT '{}',
    owner_id UUID NOT NULL,
    agency_id UUID,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'rented', 'suspended', 'draft')),
    is_featured BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des rôles administrateurs
CREATE TABLE public.admin_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'moderator')),
    granted_by UUID,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, role)
);

-- 2. CONTRAINTES ET INDEX
-- =================================================================

-- Contraintes de clés étrangères
ALTER TABLE public.profiles ADD CONSTRAINT profiles_agency_id_fkey 
    FOREIGN KEY (agency_id) REFERENCES public.agencies(id) ON DELETE SET NULL;

ALTER TABLE public.agencies ADD CONSTRAINT agencies_owner_id_fkey 
    FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.agencies ADD CONSTRAINT agencies_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.properties ADD CONSTRAINT properties_owner_id_fkey 
    FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.properties ADD CONSTRAINT properties_agency_id_fkey 
    FOREIGN KEY (agency_id) REFERENCES public.agencies(id) ON DELETE SET NULL;

ALTER TABLE public.user_subscriptions ADD CONSTRAINT user_subscriptions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.user_subscriptions ADD CONSTRAINT user_subscriptions_agency_id_fkey 
    FOREIGN KEY (agency_id) REFERENCES public.agencies(id) ON DELETE SET NULL;

ALTER TABLE public.admin_roles ADD CONSTRAINT admin_roles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.admin_roles ADD CONSTRAINT admin_roles_granted_by_fkey 
    FOREIGN KEY (granted_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Index pour les performances
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_agencies_email ON public.agencies(email);
CREATE INDEX idx_agencies_status ON public.agencies(status);
CREATE INDEX idx_properties_city ON public.properties(city);
CREATE INDEX idx_properties_type ON public.properties(type);
CREATE INDEX idx_properties_transaction_type ON public.properties(transaction_type);
CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_owner_id ON public.properties(owner_id);
CREATE INDEX idx_properties_agency_id ON public.properties(agency_id);

-- 3. FONCTIONS UTILITAIRES
-- =================================================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction sécurisée pour obtenir le rôle utilisateur
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Fonction sécurisée pour vérifier si l'utilisateur est admin
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
    SELECT EXISTS(
        SELECT 1 FROM public.admin_roles 
        WHERE user_id = auth.uid() AND is_active = true
    );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- 4. TRIGGERS
-- =================================================================

-- Triggers pour updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agencies_updated_at
    BEFORE UPDATE ON public.agencies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON public.properties
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at
    BEFORE UPDATE ON public.subscription_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 5. ACTIVATION RLS
-- =================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- 6. POLITIQUES RLS
-- =================================================================

-- Politiques pour profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (id = auth.uid());

-- Politiques pour agencies
CREATE POLICY "Agencies are viewable by everyone" ON public.agencies
    FOR SELECT USING (true);

CREATE POLICY "Agency owners can update their agency" ON public.agencies
    FOR UPDATE USING (user_id = auth.uid() OR owner_id = auth.uid());

CREATE POLICY "Users can create agencies" ON public.agencies
    FOR INSERT WITH CHECK (user_id = auth.uid() OR owner_id = auth.uid());

-- Politiques pour properties
CREATE POLICY "Properties are viewable by everyone" ON public.properties
    FOR SELECT USING (status = 'active' OR owner_id = auth.uid() OR public.is_admin_user());

CREATE POLICY "Property owners can manage their properties" ON public.properties
    FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "Users can create properties" ON public.properties
    FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Politiques pour subscription_plans
CREATE POLICY "Subscription plans are viewable by everyone" ON public.subscription_plans
    FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can manage subscription plans" ON public.subscription_plans
    FOR ALL USING (public.is_admin_user());

-- Politiques pour user_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions
    FOR SELECT USING (user_id = auth.uid() OR public.is_admin_user());

CREATE POLICY "Users can manage their own subscriptions" ON public.user_subscriptions
    FOR ALL USING (user_id = auth.uid() OR public.is_admin_user());

-- Politiques pour admin_roles
CREATE POLICY "Admin roles viewable by admins" ON public.admin_roles
    FOR SELECT USING (public.is_admin_user());

CREATE POLICY "Only super admins can manage admin roles" ON public.admin_roles
    FOR ALL USING (
        EXISTS(
            SELECT 1 FROM public.admin_roles 
            WHERE user_id = auth.uid() 
            AND role = 'super_admin' 
            AND is_active = true
        )
    );

-- 7. DONNÉES INITIALES
-- =================================================================

-- Plans d'abonnement par défaut
INSERT INTO public.subscription_plans (name, description, price, max_agencies, max_properties, features) VALUES
('Gratuit', 'Plan gratuit avec fonctionnalités de base', 0, 1, 5, '["5 propriétés max", "Support de base"]'),
('Starter', 'Plan pour débutants', 15000, 1, 20, '["20 propriétés max", "Support prioritaire", "Analytics de base"]'),
('Professional', 'Plan pour professionnels', 35000, 3, 100, '["100 propriétés max", "3 agences max", "Analytics avancées", "Support premium"]'),
('Enterprise', 'Plan pour grandes agences', 75000, 10, 500, '["500 propriétés max", "10 agences max", "Analytics complètes", "Support dédié"]');

-- Message de confirmation
SELECT 'Base de données IMMOO restaurée avec succès!' as message;