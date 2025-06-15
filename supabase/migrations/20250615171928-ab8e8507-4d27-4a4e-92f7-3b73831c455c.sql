
-- Delete all data related to agencies and properties
-- We need to delete in the correct order to respect foreign key constraints

-- First, delete all payments related to leases (which are connected to properties)
DELETE FROM payments WHERE lease_id IN (SELECT id FROM leases);

-- Delete all commissions related to properties
DELETE FROM commissions;

-- Delete all agency fees
DELETE FROM agency_fees;

-- Delete all property expenses
DELETE FROM property_expenses;

-- Delete all agency commissions
DELETE FROM agency_commissions;

-- Delete all property images
DELETE FROM property_images;

-- Delete all leases
DELETE FROM leases;

-- Delete all bookings
DELETE FROM bookings;

-- Delete all apartment leases
DELETE FROM apartment_leases;

-- Delete all owner properties details
DELETE FROM owner_properties_details;

-- Delete all owner payment history
DELETE FROM owner_payment_history;

-- Delete all agency contact access logs FIRST (before visitor_contacts)
DELETE FROM agency_contact_access_logs;

-- Delete all visitor recognition stats
DELETE FROM visitor_recognition_stats;

-- Delete all visitor sessions
DELETE FROM visitor_sessions;

-- Delete all visitor contacts (after deleting logs that reference them)
DELETE FROM visitor_contacts;

-- Delete all properties
DELETE FROM properties;

-- Delete all tenants BEFORE deleting agencies (since tenants reference agencies)
DELETE FROM tenants;

-- Delete all property owners
DELETE FROM property_owners;

-- Delete all agencies (after deleting tenants that reference them)
DELETE FROM agencies;
