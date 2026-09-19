-- 4. Add facility_id to other main tables
ALTER TABLE escalations ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES facilities(id);
ALTER TABLE visit_notes ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES facilities(id);
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES facilities(id);
ALTER TABLE health_logs ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES facilities(id);
ALTER TABLE family_invitations ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES facilities(id);

-- Assign default facility
UPDATE escalations SET facility_id = (SELECT id FROM facilities LIMIT 1) WHERE facility_id IS NULL;
UPDATE visit_notes SET facility_id = (SELECT id FROM facilities LIMIT 1) WHERE facility_id IS NULL;
UPDATE shifts SET facility_id = (SELECT id FROM facilities LIMIT 1) WHERE facility_id IS NULL;
UPDATE health_logs SET facility_id = (SELECT id FROM facilities LIMIT 1) WHERE facility_id IS NULL;
UPDATE family_invitations SET facility_id = (SELECT id FROM facilities LIMIT 1) WHERE facility_id IS NULL;

-- Drop old policies
DROP POLICY IF EXISTS "Enable read access for all users" ON escalations;
DROP POLICY IF EXISTS "Enable read access for all users" ON visit_notes;
DROP POLICY IF EXISTS "Enable read access for all users" ON shifts;
DROP POLICY IF EXISTS "Enable read access for all users" ON health_logs;
DROP POLICY IF EXISTS "Enable read access for all users" ON family_invitations;

-- Create Multi-Tenant Policies
CREATE POLICY "Users can only read escalations in their facility" ON escalations FOR SELECT USING (facility_id = (SELECT facility_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Super Admins can read all escalations" ON escalations FOR SELECT USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'superadmin'));

CREATE POLICY "Users can only read visit_notes in their facility" ON visit_notes FOR SELECT USING (facility_id = (SELECT facility_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Super Admins can read all visit_notes" ON visit_notes FOR SELECT USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'superadmin'));

CREATE POLICY "Users can only read shifts in their facility" ON shifts FOR SELECT USING (facility_id = (SELECT facility_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Super Admins can read all shifts" ON shifts FOR SELECT USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'superadmin'));

CREATE POLICY "Users can only read health_logs in their facility" ON health_logs FOR SELECT USING (facility_id = (SELECT facility_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Super Admins can read all health_logs" ON health_logs FOR SELECT USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'superadmin'));

CREATE POLICY "Users can only read family_invitations in their facility" ON family_invitations FOR SELECT USING (facility_id = (SELECT facility_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Super Admins can read all family_invitations" ON family_invitations FOR SELECT USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'superadmin'));
