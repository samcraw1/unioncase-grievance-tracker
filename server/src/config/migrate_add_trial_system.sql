--
-- Migration Script: Add 30-Day Free Trial System
-- Purpose: Add trial tracking and subscription status to users table
-- Date: 2025-11-27
--

-- Step 1: Add trial and subscription columns
DO $$
BEGIN
    -- Add trial_starts_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'trial_starts_at') THEN
        ALTER TABLE users ADD COLUMN trial_starts_at TIMESTAMP;
    END IF;

    -- Add trial_ends_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'trial_ends_at') THEN
        ALTER TABLE users ADD COLUMN trial_ends_at TIMESTAMP;
    END IF;

    -- Add subscription_status column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'subscription_status') THEN
        ALTER TABLE users ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'trial';
    END IF;
END $$;

-- Step 2: Grandfather existing users as 'active' subscribers
-- This ensures current users never see trial/expired screens
UPDATE users
SET subscription_status = 'active',
    trial_starts_at = NULL,
    trial_ends_at = NULL
WHERE subscription_status IS NULL OR subscription_status = 'trial';

-- Step 3: Add constraint for subscription_status
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_subscription_status_check;
ALTER TABLE users ADD CONSTRAINT users_subscription_status_check
  CHECK (subscription_status IN ('trial', 'active', 'expired', 'cancelled'));

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_trial_ends_at ON users(trial_ends_at) WHERE trial_ends_at IS NOT NULL;

-- Step 5: Set default for new users
ALTER TABLE users ALTER COLUMN subscription_status SET DEFAULT 'trial';

-- Verification query
SELECT
    subscription_status,
    COUNT(*) as user_count,
    COUNT(trial_starts_at) as users_with_trial_start,
    COUNT(trial_ends_at) as users_with_trial_end
FROM users
GROUP BY subscription_status;

-- Migration complete
SELECT 'Trial system migration completed successfully!' AS status;
