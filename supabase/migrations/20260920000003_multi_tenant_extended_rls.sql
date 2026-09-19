-- 4. Add facility_id to other main tables
ALTER TABLE escalations ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES facilities(id);
ALTER TABLE visit_notes ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES facilities(id);
ALTER TABLE family_invitations ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES facilities(id);
ALTER TABLE family_access ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES facilities(id);
ALTER TABLE medications ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES facilities(id);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES facilities(id);


-- Assign default facility to existing data
UPDATE escalations SET facility_id = (SELECT id FROM facilities LIMIT 1) WHERE facility_id IS NULL;
UPDATE visit_notes SET facility_id = (SELECT id FROM facilities LIMIT 1) WHERE facility_id IS NULL;
UPDATE family_invitations SET facility_id = (SELECT id FROM facilities LIMIT 1) WHERE facility_id IS NULL;
UPDATE family_access SET facility_id = (SELECT id FROM facilities LIMIT 1) WHERE facility_id IS NULL;
UPDATE medications SET facility_id = (SELECT id FROM facilities LIMIT 1) WHERE facility_id IS NULL;
UPDATE messages SET facility_id = (SELECT id FROM facilities LIMIT 1) WHERE facility_id IS NULL;


-- Drop old policies
DROP POLICY IF EXISTS "Enable read access for all users" ON escalations;
DROP POLICY IF EXISTS "Enable read access for all users" ON visit_notes;
DROP POLICY IF EXISTS "Enable read access for all users" ON family_invitations;
DROP POLICY IF EXISTS "Enable read access for all users" ON family_access;
DROP POLICY IF EXISTS "Enable read access for all users" ON medications;
DROP POLICY IF EXISTS "Enable read access for all users" ON messages;

-- Create Multi-Tenant Policies
CREATE POLICY "Users can only read escalations in their facility" ON escalations FOR SELECT USING (facility_id = (SELECT facility_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Super Admins can read all escalations" ON escalations FOR SELECT USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'superadmin'));

CREATE POLICY "Users can only read visit_notes in their facility" ON visit_notes FOR SELECT USING (facility_id = (SELECT facility_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Super Admins can read all visit_notes" ON visit_notes FOR SELECT USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'superadmin'));

CREATE POLICY "Users can only read family_invitations in their facility" ON family_invitations FOR SELECT USING (facility_id = (SELECT facility_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Super Admins can read all family_invitations" ON family_invitations FOR SELECT USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'superadmin'));

CREATE POLICY "Users can only read family_access in their facility" ON family_access FOR SELECT USING (facility_id = (SELECT facility_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Super Admins can read all family_access" ON family_access FOR SELECT USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'superadmin'));

CREATE POLICY "Users can only read medications in their facility" ON medications FOR SELECT USING (facility_id = (SELECT facility_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Super Admins can read all medications" ON medications FOR SELECT USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'superadmin'));

CREATE POLICY "Users can only read messages in their facility" ON messages FOR SELECT USING (facility_id = (SELECT facility_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Super Admins can read all messages" ON messages FOR SELECT USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'superadmin'));
