-- Migration de correction pour le schéma de subscription
-- Cette migration corrige les problèmes de types et ajoute les données manquantes

-- Étape 1: Vérifier et créer la table subscription_plans si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subscription_plans') THEN
        CREATE TABLE subscription_plans (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            price DECIMAL(10,2) NOT NULL DEFAULT 0,
            billing_cycle TEXT NOT NULL DEFAULT 'monthly',
            max_agencies INTEGER NOT NULL DEFAULT 1,
            max_properties INTEGER NOT NULL DEFAULT 1,
            max_users INTEGER NOT NULL DEFAULT 1,
            max_leases INTEGER NOT NULL DEFAULT 1,
            features JSONB DEFAULT '[]'::jsonb,
            is_active BOOLEAN DEFAULT true,
            has_api_access BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
    END IF;
END $$;

-- Étape 2: Vérifier et créer la table user_subscriptions si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_subscriptions') THEN
        CREATE TABLE user_subscriptions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            agency_id UUID,
            plan_id TEXT,
            status TEXT NOT NULL DEFAULT 'active',
            start_date DATE NOT NULL DEFAULT CURRENT_DATE,
            end_date DATE,
            payment_method TEXT DEFAULT 'free',
            auto_renew BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Ajouter la contrainte de clé étrangère après la création
        ALTER TABLE user_subscriptions 
        ADD CONSTRAINT user_subscriptions_plan_id_fkey 
        FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE RESTRICT;
        
        -- Ajouter la contrainte d'unicité
        ALTER TABLE user_subscriptions 
        ADD CONSTRAINT user_subscriptions_user_id_active_unique 
        UNIQUE(user_id) DEFERRABLE INITIALLY DEFERRED;
    END IF;
END $$;

-- Étape 3: S'assurer que la référence agency_id est correcte si la table agencies existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'agencies') THEN
        -- Ajouter la contrainte de clé étrangère pour agency_id si elle n'existe pas
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'user_subscriptions_agency_id_fkey'
        ) THEN
            ALTER TABLE user_subscriptions 
            ADD CONSTRAINT user_subscriptions_agency_id_fkey 
            FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- Étape 4: Ajouter les index si ils n'existent pas
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_user_subscriptions_user_id') THEN
        CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_user_subscriptions_plan_id') THEN
        CREATE INDEX idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_user_subscriptions_status') THEN
        CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
    END IF;
END $$;

-- Étape 5: Ajouter le plan gratuit s'il n'existe pas
INSERT INTO subscription_plans (id, name, price, billing_cycle, max_agencies, max_properties, max_users, max_leases, features, is_active)
VALUES (
    'free',
    'Gratuit',
    0.00,
    'monthly',
    1,
    1,
    1,
    2,
    '["Gestion de base"]'::jsonb,
    true
) ON CONFLICT (id) DO NOTHING;

-- Étape 6: Créer des abonnements pour les utilisateurs qui n'en ont pas
INSERT INTO user_subscriptions (user_id, plan_id, status, start_date, payment_method, auto_renew)
SELECT 
    au.id,
    'free',
    'active',
    CURRENT_DATE,
    'free',
    false
FROM auth.users au
WHERE au.id NOT IN (
    SELECT user_id 
    FROM user_subscriptions 
    WHERE user_id IS NOT NULL
) ON CONFLICT (user_id) DO NOTHING;

-- Étape 7: Message de confirmation
DO $$
DECLARE
    plan_count INTEGER;
    subscription_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO plan_count FROM subscription_plans;
    SELECT COUNT(*) INTO subscription_count FROM user_subscriptions WHERE status = 'active';
    
    RAISE NOTICE 'Migration terminée: % plans, % abonnements actifs', plan_count, subscription_count;
END $$;
