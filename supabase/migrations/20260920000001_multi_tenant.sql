-- 1. Create facilities table
CREATE TABLE IF NOT EXISTS facilities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  stripe_customer_id TEXT,
  subscription_status TEXT DEFAULT 'trialing',
  plan TEXT DEFAULT 'pilot',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;

-- 2. Insert a Default Facility to hold existing demo data
INSERT INTO facilities (name, plan) VALUES ('Aethon Alpha Hospital', 'pilot');

-- 3. Add facility_id to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES facilities(id);

-- Assign all existing users to the default facility
UPDATE user_profiles SET facility_id = (SELECT id FROM facilities LIMIT 1) WHERE facility_id IS NULL;

-- 4. Add facility_id to residents
ALTER TABLE residents ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES facilities(id);

-- Assign all existing residents to the default facility
UPDATE residents SET facility_id = (SELECT id FROM facilities LIMIT 1) WHERE facility_id IS NULL;

-- 5. Add facility_id to staff_invitations
ALTER TABLE staff_invitations ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES facilities(id);

-- Assign all existing invites to the default facility
UPDATE staff_invitations SET facility_id = (SELECT id FROM facilities LIMIT 1) WHERE facility_id IS NULL;

-- 6. Add Super Admin role to user_profiles check (we previously dropped the check constraint, but just in case)
-- Anyone with 'superadmin' role can access the God Mode dashboard.

-- Update Founders to be superadmins
UPDATE user_profiles 
SET role = 'superadmin' 
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email IN (
    'flynn@alpinahealth.ch',
    'divesh@alpinahealth.ch',
    'selena@alpinahealth.ch',
    'info@alpinahealth.ch'
  )
);
