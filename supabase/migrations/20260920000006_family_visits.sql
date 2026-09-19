CREATE TABLE IF NOT EXISTS family_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    visitor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    visitor_name TEXT NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE family_visits ENABLE ROW LEVEL SECURITY;

-- Select policies
CREATE POLICY "Staff can read all visits in their facility" 
  ON family_visits FOR SELECT 
  USING (facility_id = (SELECT facility_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Super Admins can read all visits" 
  ON family_visits FOR SELECT 
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'superadmin'));

CREATE POLICY "Family members can read their own visits" 
  ON family_visits FOR SELECT 
  USING (visitor_id = auth.uid());

-- Insert policies
CREATE POLICY "Family members can insert visits" 
  ON family_visits FOR INSERT 
  WITH CHECK (visitor_id = auth.uid());

CREATE POLICY "Staff can insert visits"
  ON family_visits FOR INSERT
  WITH CHECK (facility_id = (SELECT facility_id FROM user_profiles WHERE id = auth.uid()));

-- Update policies
CREATE POLICY "Staff can update visits in their facility" 
  ON family_visits FOR UPDATE 
  USING (facility_id = (SELECT facility_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Super Admins can update all visits" 
  ON family_visits FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'superadmin'));

CREATE POLICY "Family members can cancel their own visits" 
  ON family_visits FOR UPDATE 
  USING (visitor_id = auth.uid());
