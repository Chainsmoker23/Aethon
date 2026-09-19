-- Add Stripe subscription fields to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'pilot',
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trialing';

-- Create an index to quickly look up users by their Stripe Customer ID when webhooks arrive
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer_id 
ON user_profiles(stripe_customer_id);
