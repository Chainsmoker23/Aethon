-- 1. Policies for `facilities`
-- Super Admins can see all facilities.
-- Staff can only see their own facility.

CREATE POLICY "Super Admins can view all facilities"
  ON facilities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'superadmin'
    )
  );

CREATE POLICY "Staff can view their own facility"
  ON facilities
  FOR SELECT
  USING (
    id = (
      SELECT facility_id FROM user_profiles
      WHERE user_profiles.id = auth.uid()
    )
  );

-- 2. Update Policies for `residents`
-- We drop existing permissive policies and restrict to facility_id

DROP POLICY IF EXISTS "Enable read access for all users" ON residents;
DROP POLICY IF EXISTS "Staff can read residents" ON residents;

CREATE POLICY "Users can only read residents in their facility"
  ON residents
  FOR SELECT
  USING (
    facility_id = (
      SELECT facility_id FROM user_profiles
      WHERE user_profiles.id = auth.uid()
    )
  );

CREATE POLICY "Super Admins can read all residents"
  ON residents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'superadmin'
    )
  );

-- 3. Update Policies for `user_profiles`
-- Staff can only read user profiles in their own facility.
-- Super Admins can read all.

DROP POLICY IF EXISTS "Staff can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON user_profiles;

CREATE POLICY "Users can only read profiles in their facility"
  ON user_profiles
  FOR SELECT
  USING (
    facility_id = (
      SELECT facility_id FROM user_profiles AS up
      WHERE up.id = auth.uid()
    )
    OR id = auth.uid()
  );

CREATE POLICY "Super Admins can read all profiles"
  ON user_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles AS up
      WHERE up.id = auth.uid()
      AND up.role = 'superadmin'
    )
  );
