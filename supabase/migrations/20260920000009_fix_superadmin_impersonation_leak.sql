-- Fix: Remove Super Admin global bypass for multi-tenant tables
-- Because Super Admins use "Impersonation" (which updates their user_profiles.facility_id),
-- they should just inherit the standard Staff RLS policies for that specific facility.
-- Leaving these global bypasses on causes Super Admins to fetch ALL data across ALL facilities 
-- mixed together in their dashboard.

-- Drop SELECT overrides
DROP POLICY IF EXISTS "Super Admins can read all residents" ON residents;
DROP POLICY IF EXISTS "Super Admins can read all escalations" ON escalations;
DROP POLICY IF EXISTS "Super Admins can read all visit_notes" ON visit_notes;
DROP POLICY IF EXISTS "Super Admins can read all medications" ON medications;
DROP POLICY IF EXISTS "Super Admins can read all messages" ON messages;
DROP POLICY IF EXISTS "Super Admins can read all family_invitations" ON family_invitations;
DROP POLICY IF EXISTS "Super Admins can read all family_access" ON family_access;
DROP POLICY IF EXISTS "Super Admins can read all family_visits" ON family_visits;

-- Drop INSERT overrides
DROP POLICY IF EXISTS "Super Admins can insert anything" ON residents;
DROP POLICY IF EXISTS "Super Admins can insert anything" ON escalations;
DROP POLICY IF EXISTS "Super Admins can insert anything" ON visit_notes;
DROP POLICY IF EXISTS "Super Admins can insert anything" ON medications;
DROP POLICY IF EXISTS "Super Admins can insert anything" ON messages;
DROP POLICY IF EXISTS "Super Admins can insert anything" ON family_invitations;
DROP POLICY IF EXISTS "Super Admins can insert anything" ON family_access;
DROP POLICY IF EXISTS "Super Admins can insert anything" ON family_visits;

-- Drop UPDATE overrides
DROP POLICY IF EXISTS "Super Admins can update anything" ON residents;
DROP POLICY IF EXISTS "Super Admins can update anything" ON escalations;
DROP POLICY IF EXISTS "Super Admins can update anything" ON visit_notes;
DROP POLICY IF EXISTS "Super Admins can update anything" ON medications;
DROP POLICY IF EXISTS "Super Admins can update anything" ON messages;
DROP POLICY IF EXISTS "Super Admins can update anything" ON family_visits;

-- Drop DELETE overrides
DROP POLICY IF EXISTS "Super Admins can delete anything" ON residents;
DROP POLICY IF EXISTS "Super Admins can delete anything" ON escalations;
DROP POLICY IF EXISTS "Super Admins can delete anything" ON visit_notes;
DROP POLICY IF EXISTS "Super Admins can delete anything" ON medications;
DROP POLICY IF EXISTS "Super Admins can delete anything" ON messages;
DROP POLICY IF EXISTS "Super Admins can delete anything" ON family_visits;
