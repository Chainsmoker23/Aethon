-- Enable INSERT for Multi-Tenant Tables

-- residents
CREATE POLICY "Staff can insert residents in their facility"
  ON residents
  FOR INSERT
  WITH CHECK (
    facility_id = (
      SELECT facility_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- escalations
CREATE POLICY "Staff can insert escalations in their facility"
  ON escalations
  FOR INSERT
  WITH CHECK (
    facility_id = (
      SELECT facility_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- visit_notes
CREATE POLICY "Staff can insert visit_notes in their facility"
  ON visit_notes
  FOR INSERT
  WITH CHECK (
    facility_id = (
      SELECT facility_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- family_invitations
CREATE POLICY "Staff can insert family_invitations in their facility"
  ON family_invitations
  FOR INSERT
  WITH CHECK (
    facility_id = (
      SELECT facility_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- family_access
CREATE POLICY "Staff can insert family_access in their facility"
  ON family_access
  FOR INSERT
  WITH CHECK (
    facility_id = (
      SELECT facility_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- medications
CREATE POLICY "Staff can insert medications in their facility"
  ON medications
  FOR INSERT
  WITH CHECK (
    facility_id = (
      SELECT facility_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- messages
CREATE POLICY "Users can insert messages in their facility"
  ON messages
  FOR INSERT
  WITH CHECK (
    facility_id = (
      SELECT facility_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Super Admin fallbacks
CREATE POLICY "Super Admins can insert anything" ON residents FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'superadmin'));
CREATE POLICY "Super Admins can insert anything" ON escalations FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'superadmin'));
CREATE POLICY "Super Admins can insert anything" ON visit_notes FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'superadmin'));
CREATE POLICY "Super Admins can insert anything" ON family_invitations FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'superadmin'));
CREATE POLICY "Super Admins can insert anything" ON family_access FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'superadmin'));
CREATE POLICY "Super Admins can insert anything" ON medications FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'superadmin'));
CREATE POLICY "Super Admins can insert anything" ON messages FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'superadmin'));
