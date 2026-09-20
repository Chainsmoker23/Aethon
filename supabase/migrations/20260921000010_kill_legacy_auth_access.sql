-- Kill legacy "Auth access" auto-generated policies that bypass multi-tenancy
DROP POLICY IF EXISTS "Auth access residents" ON residents;
DROP POLICY IF EXISTS "Auth access escalations" ON escalations;
DROP POLICY IF EXISTS "Auth access visit_notes" ON visit_notes;
DROP POLICY IF EXISTS "Auth access medications" ON medications;
DROP POLICY IF EXISTS "Auth access messages" ON messages;
DROP POLICY IF EXISTS "Auth access family_invitations" ON family_invitations;
DROP POLICY IF EXISTS "Auth access family_access" ON family_access;
DROP POLICY IF EXISTS "Auth access family_visits" ON family_visits;
DROP POLICY IF EXISTS "Auth access user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Auth access staff_invitations" ON staff_invitations;
DROP POLICY IF EXISTS "Auth access facilities" ON facilities;

-- Re-create correct multi-tenant SELECT policies
DROP POLICY IF EXISTS "Users can only read residents in their facility" ON residents;
CREATE POLICY "Users can only read residents in their facility"
  ON residents FOR SELECT
  USING (facility_id = (SELECT facility_id FROM user_profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can only read escalations in their facility" ON escalations;
CREATE POLICY "Users can only read escalations in their facility"
  ON escalations FOR SELECT
  USING (facility_id = (SELECT facility_id FROM user_profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can only read visit_notes in their facility" ON visit_notes;
CREATE POLICY "Users can only read visit_notes in their facility"
  ON visit_notes FOR SELECT
  USING (facility_id = (SELECT facility_id FROM user_profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can only read medications in their facility" ON medications;
CREATE POLICY "Users can only read medications in their facility"
  ON medications FOR SELECT
  USING (facility_id = (SELECT facility_id FROM user_profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can only read messages in their facility" ON messages;
CREATE POLICY "Users can only read messages in their facility"
  ON messages FOR SELECT
  USING (facility_id = (SELECT facility_id FROM user_profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can only read family_invitations in their facility" ON family_invitations;
CREATE POLICY "Users can only read family_invitations in their facility"
  ON family_invitations FOR SELECT
  USING (facility_id = (SELECT facility_id FROM user_profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can only read family_access in their facility" ON family_access;
CREATE POLICY "Users can only read family_access in their facility"
  ON family_access FOR SELECT
  USING (facility_id = (SELECT facility_id FROM user_profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can only read family_visits in their facility" ON family_visits;
CREATE POLICY "Users can only read family_visits in their facility"
  ON family_visits FOR SELECT
  USING (facility_id = (SELECT facility_id FROM user_profiles WHERE id = auth.uid()));
