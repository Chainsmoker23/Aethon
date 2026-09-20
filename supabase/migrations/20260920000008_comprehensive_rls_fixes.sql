-- 1. Automatic facility_id injection via trigger
CREATE OR REPLACE FUNCTION set_facility_id_from_auth()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.facility_id IS NULL THEN
    NEW.facility_id := (SELECT facility_id FROM user_profiles WHERE id = auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to tables that might be inserted from the UI without a facility_id
DROP TRIGGER IF EXISTS trg_set_facility_id_visit_notes ON visit_notes;
CREATE TRIGGER trg_set_facility_id_visit_notes
  BEFORE INSERT ON visit_notes
  FOR EACH ROW EXECUTE FUNCTION set_facility_id_from_auth();

DROP TRIGGER IF EXISTS trg_set_facility_id_medications ON medications;
CREATE TRIGGER trg_set_facility_id_medications
  BEFORE INSERT ON medications
  FOR EACH ROW EXECUTE FUNCTION set_facility_id_from_auth();

DROP TRIGGER IF EXISTS trg_set_facility_id_messages ON messages;
CREATE TRIGGER trg_set_facility_id_messages
  BEFORE INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION set_facility_id_from_auth();

DROP TRIGGER IF EXISTS trg_set_facility_id_escalations ON escalations;
CREATE TRIGGER trg_set_facility_id_escalations
  BEFORE INSERT ON escalations
  FOR EACH ROW EXECUTE FUNCTION set_facility_id_from_auth();


-- 2. Allow users to update their own profiles (Onboarding fix)
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Super Admins can update any profile" ON user_profiles;
CREATE POLICY "Super Admins can update any profile"
  ON user_profiles
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'superadmin'));


-- 3. Update & Delete Policies for Multi-Tenant Tables

-- Residents
DROP POLICY IF EXISTS "Staff can update residents in their facility" ON residents;
CREATE POLICY "Staff can update residents in their facility" ON residents FOR UPDATE USING (facility_id = (SELECT facility_id FROM user_profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Staff can delete residents in their facility" ON residents;
CREATE POLICY "Staff can delete residents in their facility" ON residents FOR DELETE USING (facility_id = (SELECT facility_id FROM user_profiles WHERE id = auth.uid()));

-- Escalations (Resolving flags)
DROP POLICY IF EXISTS "Staff can update escalations in their facility" ON escalations;
CREATE POLICY "Staff can update escalations in their facility" ON escalations FOR UPDATE USING (facility_id = (SELECT facility_id FROM user_profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Staff can delete escalations in their facility" ON escalations;
CREATE POLICY "Staff can delete escalations in their facility" ON escalations FOR DELETE USING (facility_id = (SELECT facility_id FROM user_profiles WHERE id = auth.uid()));

-- Visit Notes
DROP POLICY IF EXISTS "Staff can update visit_notes in their facility" ON visit_notes;
CREATE POLICY "Staff can update visit_notes in their facility" ON visit_notes FOR UPDATE USING (facility_id = (SELECT facility_id FROM user_profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Staff can delete visit_notes in their facility" ON visit_notes;
CREATE POLICY "Staff can delete visit_notes in their facility" ON visit_notes FOR DELETE USING (facility_id = (SELECT facility_id FROM user_profiles WHERE id = auth.uid()));

-- Medications
DROP POLICY IF EXISTS "Staff can update medications in their facility" ON medications;
CREATE POLICY "Staff can update medications in their facility" ON medications FOR UPDATE USING (facility_id = (SELECT facility_id FROM user_profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Staff can delete medications in their facility" ON medications;
CREATE POLICY "Staff can delete medications in their facility" ON medications FOR DELETE USING (facility_id = (SELECT facility_id FROM user_profiles WHERE id = auth.uid()));

-- Messages
DROP POLICY IF EXISTS "Staff can update messages in their facility" ON messages;
CREATE POLICY "Staff can update messages in their facility" ON messages FOR UPDATE USING (facility_id = (SELECT facility_id FROM user_profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Staff can delete messages in their facility" ON messages;
CREATE POLICY "Staff can delete messages in their facility" ON messages FOR DELETE USING (facility_id = (SELECT facility_id FROM user_profiles WHERE id = auth.uid()));

-- Family Visits (Approving/Denying)
DROP POLICY IF EXISTS "Staff can update family_visits in their facility" ON family_visits;
CREATE POLICY "Staff can update family_visits in their facility" ON family_visits FOR UPDATE USING (facility_id = (SELECT facility_id FROM user_profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Staff can delete family_visits in their facility" ON family_visits;
CREATE POLICY "Staff can delete family_visits in their facility" ON family_visits FOR DELETE USING (facility_id = (SELECT facility_id FROM user_profiles WHERE id = auth.uid()));


-- 4. Super Admin Fallback for Update/Delete
CREATE POLICY "Super Admins can update anything" ON residents FOR UPDATE USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'superadmin'));
CREATE POLICY "Super Admins can delete anything" ON residents FOR DELETE USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'superadmin'));
CREATE POLICY "Super Admins can update anything" ON escalations FOR UPDATE USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'superadmin'));
CREATE POLICY "Super Admins can delete anything" ON escalations FOR DELETE USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'superadmin'));
CREATE POLICY "Super Admins can update anything" ON visit_notes FOR UPDATE USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'superadmin'));
CREATE POLICY "Super Admins can delete anything" ON visit_notes FOR DELETE USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'superadmin'));
CREATE POLICY "Super Admins can update anything" ON medications FOR UPDATE USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'superadmin'));
CREATE POLICY "Super Admins can delete anything" ON medications FOR DELETE USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'superadmin'));
CREATE POLICY "Super Admins can update anything" ON messages FOR UPDATE USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'superadmin'));
CREATE POLICY "Super Admins can delete anything" ON messages FOR DELETE USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'superadmin'));
CREATE POLICY "Super Admins can update anything" ON family_visits FOR UPDATE USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'superadmin'));
CREATE POLICY "Super Admins can delete anything" ON family_visits FOR DELETE USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'superadmin'));
