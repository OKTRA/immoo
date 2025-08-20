-- AJOUT DES TABLES MANQUANTES POUR IMMOO
-- =================================================================

-- Table des images de propriétés (séparée pour une meilleure gestion)
CREATE TABLE public.property_images (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_name TEXT,
    image_size INTEGER,
    is_primary BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des favoris/wishlist
CREATE TABLE public.user_favorites (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, property_id)
);

-- Table des vues de propriétés (analytics)
CREATE TABLE public.property_views (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    visitor_ip TEXT,
    user_agent TEXT,
    referrer TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des messages/demandes de renseignements
CREATE TABLE public.property_inquiries (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    sender_phone TEXT,
    message TEXT NOT NULL,
    inquiry_type TEXT DEFAULT 'general' CHECK (inquiry_type IN ('general', 'visit_request', 'price_inquiry', 'availability')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    responded_at TIMESTAMP WITH TIME ZONE
);

-- Table des avis/évaluations
CREATE TABLE public.reviews (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reviewed_agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
    reviewed_property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CHECK (
        (reviewed_agency_id IS NOT NULL AND reviewed_property_id IS NULL) OR
        (reviewed_agency_id IS NULL AND reviewed_property_id IS NOT NULL)
    )
);

-- Table des notifications
CREATE TABLE public.notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('inquiry', 'review', 'subscription', 'property', 'system')),
    related_id UUID, -- ID de l'objet lié (propriété, demande, etc.)
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des villes/localités
CREATE TABLE public.cities (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    country TEXT DEFAULT 'Côte d''Ivoire',
    region TEXT,
    is_active BOOLEAN DEFAULT true,
    properties_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des caractéristiques de propriétés
CREATE TABLE public.property_features (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    feature_name TEXT NOT NULL,
    feature_value TEXT,
    feature_type TEXT DEFAULT 'boolean' CHECK (feature_type IN ('boolean', 'number', 'text')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des contrats/transactions
CREATE TABLE public.contracts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    agency_id UUID REFERENCES public.agencies(id) ON DELETE SET NULL,
    contract_type TEXT NOT NULL CHECK (contract_type IN ('sale', 'rental')),
    price DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'XOF',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'signed', 'completed', 'cancelled')),
    start_date DATE,
    end_date DATE, -- Pour les locations
    commission DECIMAL(5,2), -- Pourcentage de commission
    terms TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    signed_at TIMESTAMP WITH TIME ZONE
);

-- Table des paiements/transactions
CREATE TABLE public.payment_transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE SET NULL,
    contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'XOF',
    payment_method TEXT NOT NULL,
    transaction_id TEXT UNIQUE,
    external_transaction_id TEXT, -- ID du provider de paiement
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_provider TEXT DEFAULT 'cinetpay',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Index pour les performances
CREATE INDEX idx_property_images_property_id ON public.property_images(property_id);
CREATE INDEX idx_property_images_is_primary ON public.property_images(is_primary);
CREATE INDEX idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX idx_user_favorites_property_id ON public.user_favorites(property_id);
CREATE INDEX idx_property_views_property_id ON public.property_views(property_id);
CREATE INDEX idx_property_views_viewed_at ON public.property_views(viewed_at);
CREATE INDEX idx_property_inquiries_property_id ON public.property_inquiries(property_id);
CREATE INDEX idx_property_inquiries_status ON public.property_inquiries(status);
CREATE INDEX idx_reviews_agency_id ON public.reviews(reviewed_agency_id);
CREATE INDEX idx_reviews_property_id ON public.reviews(reviewed_property_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_cities_slug ON public.cities(slug);
CREATE INDEX idx_property_features_property_id ON public.property_features(property_id);
CREATE INDEX idx_contracts_property_id ON public.contracts(property_id);
CREATE INDEX idx_contracts_status ON public.contracts(status);
CREATE INDEX idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_status ON public.payment_transactions(status);

-- Triggers pour updated_at
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at
    BEFORE UPDATE ON public.contracts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Activation RLS pour toutes les nouvelles tables
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les nouvelles tables

-- property_images
CREATE POLICY "Images are viewable by everyone" ON public.property_images
    FOR SELECT USING (true);
CREATE POLICY "Property owners can manage images" ON public.property_images
    FOR ALL USING (
        EXISTS(SELECT 1 FROM public.properties WHERE id = property_id AND owner_id = auth.uid())
    );

-- user_favorites
CREATE POLICY "Users can view their own favorites" ON public.user_favorites
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage their own favorites" ON public.user_favorites
    FOR ALL USING (user_id = auth.uid());

-- property_views (lecture seule pour les propriétaires et admins)
CREATE POLICY "Property owners and admins can view analytics" ON public.property_views
    FOR SELECT USING (
        EXISTS(SELECT 1 FROM public.properties WHERE id = property_id AND owner_id = auth.uid()) OR
        public.is_admin_user()
    );

-- property_inquiries
CREATE POLICY "Everyone can create inquiries" ON public.property_inquiries
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Property owners can view inquiries" ON public.property_inquiries
    FOR SELECT USING (
        EXISTS(SELECT 1 FROM public.properties WHERE id = property_id AND owner_id = auth.uid()) OR
        sender_id = auth.uid()
    );
CREATE POLICY "Property owners can update inquiries" ON public.property_inquiries
    FOR UPDATE USING (
        EXISTS(SELECT 1 FROM public.properties WHERE id = property_id AND owner_id = auth.uid())
    );

-- reviews
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
    FOR SELECT USING (status = 'approved');
CREATE POLICY "Users can create reviews" ON public.reviews
    FOR INSERT WITH CHECK (reviewer_id = auth.uid());
CREATE POLICY "Users can update their own reviews" ON public.reviews
    FOR UPDATE USING (reviewer_id = auth.uid());

-- notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- cities (lecture publique)
CREATE POLICY "Cities are viewable by everyone" ON public.cities
    FOR SELECT USING (is_active = true);

-- property_features
CREATE POLICY "Features are viewable by everyone" ON public.property_features
    FOR SELECT USING (true);
CREATE POLICY "Property owners can manage features" ON public.property_features
    FOR ALL USING (
        EXISTS(SELECT 1 FROM public.properties WHERE id = property_id AND owner_id = auth.uid())
    );

-- contracts
CREATE POLICY "Contract parties can view contracts" ON public.contracts
    FOR SELECT USING (
        buyer_id = auth.uid() OR 
        seller_id = auth.uid() OR 
        public.is_admin_user()
    );
CREATE POLICY "Sellers can create contracts" ON public.contracts
    FOR INSERT WITH CHECK (seller_id = auth.uid());
CREATE POLICY "Contract parties can update contracts" ON public.contracts
    FOR UPDATE USING (
        buyer_id = auth.uid() OR 
        seller_id = auth.uid() OR 
        public.is_admin_user()
    );

-- payment_transactions
CREATE POLICY "Users can view their own transactions" ON public.payment_transactions
    FOR SELECT USING (user_id = auth.uid() OR public.is_admin_user());
CREATE POLICY "Users can create their own transactions" ON public.payment_transactions
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Données initiales pour les villes principales de Côte d'Ivoire
INSERT INTO public.cities (name, slug, region) VALUES
('Abidjan', 'abidjan', 'Lagunes'),
('Bouaké', 'bouake', 'Vallée du Bandama'),
('Daloa', 'daloa', 'Haut-Sassandra'),
('Yamoussoukro', 'yamoussoukro', 'Lacs'),
('San-Pédro', 'san-pedro', 'Bas-Sassandra'),
('Korhogo', 'korhogo', 'Savanes'),
('Man', 'man', 'Montagnes'),
('Divo', 'divo', 'Lôh-Djiboua'),
('Gagnoa', 'gagnoa', 'Gôh'),
('Anyama', 'anyama', 'Lagunes'),
('Abengourou', 'abengourou', 'Indénié-Djuablin'),
('Grand-Bassam', 'grand-bassam', 'Sud-Comoé'),
('Sassandra', 'sassandra', 'Gbôklé'),
('Bondoukou', 'bondoukou', 'Gontougo'),
('Agnibilékrou', 'agnibilekrou', 'Indénié-Djuablin');

SELECT 'Tables manquantes ajoutées avec succès!' as message;