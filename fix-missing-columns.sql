-- Ajouter les colonnes manquantes dans user_subscriptions

-- 1. Ajouter payment_method s'il n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_subscriptions' 
        AND column_name = 'payment_method'
    ) THEN
        ALTER TABLE user_subscriptions 
        ADD COLUMN payment_method TEXT DEFAULT 'free';
    END IF;
END $$;

-- 2. Ajouter auto_renew s'il n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_subscriptions' 
        AND column_name = 'auto_renew'
    ) THEN
        ALTER TABLE user_subscriptions 
        ADD COLUMN auto_renew BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 3. Ajouter start_date s'il n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_subscriptions' 
        AND column_name = 'start_date'
    ) THEN
        ALTER TABLE user_subscriptions 
        ADD COLUMN start_date DATE DEFAULT CURRENT_DATE;
    END IF;
END $$;

-- 4. Ajouter end_date s'il n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_subscriptions' 
        AND column_name = 'end_date'
    ) THEN
        ALTER TABLE user_subscriptions 
        ADD COLUMN end_date DATE;
    END IF;
END $$;

-- 5. Mettre à jour les colonnes existantes avec les bonnes valeurs
UPDATE user_subscriptions 
SET 
    payment_method = 'free',
    auto_renew = false,
    start_date = CURRENT_DATE
WHERE payment_method IS NULL OR start_date IS NULL;

-- 6. Vérifier la structure finale
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_subscriptions' 
ORDER BY ordinal_position;
