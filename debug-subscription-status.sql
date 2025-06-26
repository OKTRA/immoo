-- Debug script pour vérifier l'état des abonnements

-- === PLANS D'ABONNEMENT ===
SELECT 
    id, 
    name, 
    price, 
    billing_cycle,
    max_properties,
    max_agencies,
    max_leases,
    max_users
FROM subscription_plans 
ORDER BY price ASC;

-- === ABONNEMENTS UTILISATEURS ===
SELECT 
    us.id as subscription_id,
    us.user_id,
    p.email,
    us.plan_id,
    sp.name as plan_name,
    sp.price,
    us.status,
    us.start_date,
    us.end_date,
    us.created_at
FROM user_subscriptions us
LEFT JOIN auth.users au ON us.user_id = au.id
LEFT JOIN profiles p ON us.user_id = p.id
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
ORDER BY us.created_at DESC;

-- === COMPTAGE DES RESSOURCES PAR UTILISATEUR ===
SELECT 
    p.email,
    p.id as user_id,
    COUNT(DISTINCT a.id) as agencies_count,
    COUNT(DISTINCT pr.id) as properties_count,
    COUNT(DISTINCT l.id) as active_leases_count
FROM profiles p
LEFT JOIN agencies a ON p.id = a.user_id
LEFT JOIN properties pr ON a.id = pr.agency_id
LEFT JOIN leases l ON pr.id = l.property_id AND l.is_active = true
WHERE p.role = 'agency'
GROUP BY p.id, p.email
ORDER BY p.email;

-- === UTILISATEURS SANS ABONNEMENT ACTIF ===
SELECT 
    p.id,
    p.email,
    p.role
FROM profiles p
LEFT JOIN user_subscriptions us ON p.id = us.user_id AND us.status = 'active'
WHERE p.role = 'agency' AND us.id IS NULL
ORDER BY p.email; 