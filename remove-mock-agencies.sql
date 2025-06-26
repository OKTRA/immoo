-- Script de suppression COMPLETE des agences mock et test data
-- Ce script supprime TOUT les données de test et mock de la base

-- =============================================================================
-- 1. DÉSACTIVER TEMPORAIREMENT LES CONTRAINTES
-- =============================================================================

-- Désactiver les triggers et contraintes pendant le nettoyage
SET session_replication_role = replica;

-- =============================================================================
-- 2. SUPPRIMER TOUTES LES DONNÉES DE TEST ET MOCK
-- =============================================================================

-- Supprimer tous les paiements liés aux baux de test
DELETE FROM payments 
WHERE lease_id IN (
    SELECT l.id FROM leases l
    JOIN properties p ON l.property_id = p.id
    JOIN agencies a ON p.agency_id = a.id
    WHERE a.name ILIKE '%mock%' 
       OR a.name ILIKE '%test%'
       OR a.name ILIKE '%demo%'
       OR a.name ILIKE '%example%'
       OR a.name ILIKE '%sample%'
       OR a.name LIKE 'Agency %'
       OR a.name LIKE 'Test Agency%'
       OR a.name LIKE 'Stress Test%'
       OR a.name LIKE 'Unlimited Agency%'
       OR a.email LIKE '%test%'
       OR a.email LIKE '%mock%'
       OR a.email LIKE '%example%'
);

-- Supprimer les baux de test
DELETE FROM leases 
WHERE property_id IN (
    SELECT p.id FROM properties p
    JOIN agencies a ON p.agency_id = a.id
    WHERE a.name ILIKE '%mock%' 
       OR a.name ILIKE '%test%'
       OR a.name ILIKE '%demo%'
       OR a.name ILIKE '%example%'
       OR a.name ILIKE '%sample%'
       OR a.name LIKE 'Agency %'
       OR a.name LIKE 'Test Agency%'
       OR a.name LIKE 'Stress Test%'
       OR a.name LIKE 'Unlimited Agency%'
       OR a.email LIKE '%test%'
       OR a.email LIKE '%mock%'
       OR a.email LIKE '%example%'
);

-- Supprimer les propriétés des agences mock/test
DELETE FROM properties 
WHERE agency_id IN (
    SELECT id FROM agencies 
    WHERE name ILIKE '%mock%' 
       OR name ILIKE '%test%'
       OR name ILIKE '%demo%'
       OR name ILIKE '%example%'
       OR name ILIKE '%sample%'
       OR name LIKE 'Agency %'
       OR name LIKE 'Test Agency%'
       OR name LIKE 'Stress Test%'
       OR name LIKE 'Unlimited Agency%'
       OR email LIKE '%test%'
       OR email LIKE '%mock%'
       OR email LIKE '%example%'
);

-- Supprimer les profils liés aux agences mock (SET NULL d'abord)
UPDATE profiles 
SET agency_id = NULL 
WHERE agency_id IN (
    SELECT id FROM agencies 
    WHERE name ILIKE '%mock%' 
       OR name ILIKE '%test%'
       OR name ILIKE '%demo%'
       OR name ILIKE '%example%'
       OR name ILIKE '%sample%'
       OR name LIKE 'Agency %'
       OR name LIKE 'Test Agency%'
       OR name LIKE 'Stress Test%'
       OR name LIKE 'Unlimited Agency%'
       OR email LIKE '%test%'
       OR email LIKE '%mock%'
       OR email LIKE '%example%'
);

-- Supprimer les abonnements des utilisateurs test
DELETE FROM user_subscriptions 
WHERE user_id IN (
    SELECT p.id FROM profiles p
    WHERE p.email LIKE '%test%'
       OR p.email LIKE '%mock%'
       OR p.email LIKE '%example%'
       OR p.email = 'test-user-001@example.com'
       OR p.id = 'test-user-001'
);

-- Supprimer les utilisateurs de test
DELETE FROM profiles 
WHERE email LIKE '%test%'
   OR email LIKE '%mock%'
   OR email LIKE '%example%'
   OR email = 'test-user-001@example.com'
   OR id = 'test-user-001';

-- Supprimer les plans de test
DELETE FROM subscription_plans 
WHERE name ILIKE '%test%'
   OR name ILIKE '%mock%'
   OR name ILIKE '%demo%'
   OR name LIKE 'Test Unlimited Plan'
   OR description ILIKE '%test%';

-- ENFIN, supprimer toutes les agences mock/test
DELETE FROM agencies 
WHERE name ILIKE '%mock%' 
   OR name ILIKE '%test%'
   OR name ILIKE '%demo%'
   OR name ILIKE '%example%'
   OR name ILIKE '%sample%'
   OR name LIKE 'Agency %'
   OR name LIKE 'Test Agency%'
   OR name LIKE 'Stress Test%'
   OR name LIKE 'Unlimited Agency%'
   OR email LIKE '%test%'
   OR email LIKE '%mock%'
   OR email LIKE '%example%'
   OR description = 'This is a mock agency description'
   OR description ILIKE '%test%'
   OR description ILIKE '%mock%';

-- =============================================================================
-- 3. RÉTABLIR LES CONTRAINTES
-- =============================================================================

-- Réactiver les contraintes
SET session_replication_role = DEFAULT;

-- =============================================================================
-- 4. VÉRIFICATIONS FINALES
-- =============================================================================

-- Vérifier qu'il ne reste plus d'agences mock
SELECT 
    'AGENCES RESTANTES APRÈS NETTOYAGE' as verification,
    COUNT(*) as total_agencies,
    COUNT(CASE WHEN name ILIKE '%mock%' OR name ILIKE '%test%' THEN 1 END) as mock_agencies_remaining
FROM agencies;

-- Lister les agences qui restent
SELECT 
    'AGENCES VALIDES RESTANTES' as section,
    id,
    name,
    email,
    created_at
FROM agencies
ORDER BY created_at DESC;

-- Vérifier les utilisateurs restants
SELECT 
    'UTILISATEURS VALIDES RESTANTS' as section,
    id,
    email,
    role,
    agency_id,
    created_at
FROM profiles
WHERE email NOT LIKE '%test%' AND email NOT LIKE '%mock%'
ORDER BY created_at DESC;

SELECT 'NETTOYAGE COMPLET TERMINÉ ✅' as resultat;