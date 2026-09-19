-- Expand Residents table for Phase 1 MVP (P1-01)
ALTER TABLE residents 
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS emergency_contacts JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS allergies TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS insurance_details TEXT,
ADD COLUMN IF NOT EXISTS physician_name TEXT,
ADD COLUMN IF NOT EXISTS physician_contact TEXT,
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Update the INSERT RLS policy to allow these fields? 
-- Actually, the existing `FOR INSERT` policy doesn't restrict columns, only the `facility_id` via `WITH CHECK`.
-- Same for `UPDATE` policy.
-- Wait, did I ever create an `UPDATE` policy for `residents`?
-- Let's ensure staff can UPDATE residents in their facility.

DROP POLICY IF EXISTS "Staff can update residents in their facility" ON residents;
CREATE POLICY "Staff can update residents in their facility"
  ON residents
  FOR UPDATE
  USING (
    facility_id = (
      SELECT facility_id FROM user_profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Super Admins can update anything" ON residents;
CREATE POLICY "Super Admins can update anything"
  ON residents
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'superadmin')
  );
