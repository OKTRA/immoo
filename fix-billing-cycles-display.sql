-- =============================================================================
-- SCRIPT DE CORRECTION DES CYCLES DE FACTURATION ET PLAN GRATUIT
-- =============================================================================

-- 1. Vérifier les plans existants et leurs cycles
SELECT 
    '📋 PLANS ACTUELS' as section,
    id,
    name, 
    price,
    billing_cycle,
    CASE 
        WHEN billing_cycle = 'monthly' THEN '/mois'
        WHEN billing_cycle = 'quarterly' THEN '/trimestre' 
        WHEN billing_cycle = 'semestriel' THEN '/6 mois'
        WHEN billing_cycle = 'yearly' OR billing_cycle = 'annual' THEN '/an'
        WHEN billing_cycle = 'lifetime' THEN ' (à vie)'
        ELSE billing_cycle
    END as suffixe_affichage,
    max_agencies,
    max_properties,
    max_users,
    max_leases,
    is_active
FROM subscription_plans 
ORDER BY price;

-- 2. Identifier le problème : plan à 15000 FCFA avec billing_cycle incorrect
SELECT 
    '⚠️ PLANS AVEC PROBLÈME DE CYCLE' as section,
    id,
    name,
    price,
    billing_cycle,
    'PROBLÈME: Devrait être semestriel si prix = 15000 FCFA' as probleme
FROM subscription_plans 
WHERE price = 15000 AND billing_cycle != 'semestriel';

-- 3. Corriger le cycle de facturation du plan à 15000 FCFA
UPDATE subscription_plans 
SET 
    billing_cycle = 'semestriel',
    name = CASE 
        WHEN name LIKE '%PRO%' THEN 'PRO Semestriel'
        WHEN name LIKE '%Pro%' THEN 'Pro Semestriel'
        ELSE name || ' (6 mois)'
    END,
    updated_at = NOW()
WHERE price = 15000;

-- 4. Vérifier qu'il existe un plan gratuit par défaut
SELECT 
    '🆓 PLAN GRATUIT ACTUEL' as section,
    id,
    name,
    price,
    billing_cycle,
    max_agencies,
    max_properties,
    max_users,
    max_leases,
    is_active
FROM subscription_plans 
WHERE price = 0 AND is_active = true;

-- 5. Créer ou corriger le plan gratuit si nécessaire
INSERT INTO subscription_plans (
    id, 
    name, 
    price, 
    billing_cycle, 
    max_agencies, 
    max_properties, 
    max_users, 
    max_leases, 
    features, 
    is_active
) VALUES (
    'free-default',
    'Gratuit',
    0.00,
    'monthly',
    1,
    5,
    1,
    10,
    '["Gestion de base", "Support email"]'::jsonb,
    true
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    billing_cycle = EXCLUDED.billing_cycle,
    max_agencies = EXCLUDED.max_agencies,
    max_properties = EXCLUDED.max_properties,
    max_users = EXCLUDED.max_users,
    max_leases = EXCLUDED.max_leases,
    features = EXCLUDED.features,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- 6. S'assurer que tous les utilisateurs ont un abonnement gratuit par défaut
INSERT INTO user_subscriptions (
    user_id,
    plan_id,
    status,
    start_date,
    end_date,
    payment_method,
    auto_renew
) 
SELECT 
    au.id,
    'free-default',
    'active',
    CURRENT_DATE,
    NULL, -- Plan gratuit sans expiration
    'free',
    false
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM user_subscriptions us 
    WHERE us.user_id = au.id 
    AND us.status = 'active'
)
ON CONFLICT DO NOTHING;

-- 7. Vérifier les corrections
SELECT 
    '✅ RÉSULTAT APRÈS CORRECTION' as section,
    id,
    name,
    price,
    billing_cycle,
    CASE 
        WHEN billing_cycle = 'monthly' THEN '/mois'
        WHEN billing_cycle = 'quarterly' THEN '/trimestre' 
        WHEN billing_cycle = 'semestriel' THEN '/6 mois'
        WHEN billing_cycle = 'yearly' OR billing_cycle = 'annual' THEN '/an'
        WHEN billing_cycle = 'lifetime' THEN ' (à vie)'
        ELSE billing_cycle
    END as suffixe_correct,
    max_agencies,
    max_properties,
    is_active
FROM subscription_plans 
ORDER BY price;

-- 8. Vérifier les abonnements actifs
SELECT 
    '👥 ABONNEMENTS ACTIFS' as section,
    COUNT(*) as total_abonnements,
    sp.name as plan_name,
    sp.price,
    sp.billing_cycle
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.status = 'active'
GROUP BY sp.id, sp.name, sp.price, sp.billing_cycle
ORDER BY sp.price;

-- 9. Message de confirmation
SELECT 
    '🎉 CORRECTION TERMINÉE' as message,
    'Les cycles de facturation sont maintenant corrects:' as details_1,
    '• Plan gratuit : attributé par défaut (monthly)' as details_2,
    '• Plan 15000 FCFA : cycle semestriel (/6 mois)' as details_3,
    '• Plan 25000 FCFA : cycle annuel (/an)' as details_4,
    '• Tous les utilisateurs ont un abonnement gratuit par défaut' as details_5; 