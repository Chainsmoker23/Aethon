-- Create staff_invitations table
CREATE TABLE IF NOT EXISTS staff_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'caregiver',
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE staff_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view and manage invitations"
  ON staff_invitations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND (user_profiles.role = 'admin' OR user_profiles.role = 'staff')
    )
  );
