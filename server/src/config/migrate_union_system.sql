--
-- Migration Script: Update Union/Craft System
-- Purpose: Migrate existing database to new union structure
-- Date: 2025-11-23
--

-- Step 1: Add union_type column to users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'union_type') THEN
        ALTER TABLE users ADD COLUMN union_type VARCHAR(50);
    END IF;
END $$;

-- Step 2: Migrate existing craft data to new values
-- Map 'carrier' to 'city_carrier' and set union_type to 'nalc'
UPDATE users
SET craft = 'city_carrier', union_type = 'nalc'
WHERE craft = 'carrier';

UPDATE grievances
SET craft = 'city_carrier'
WHERE craft = 'carrier';

-- Map 'clerk' craft to 'clerk' (no change) and set union_type to 'apwu'
UPDATE users
SET union_type = 'apwu'
WHERE craft = 'clerk';

-- Map 'maintenance' craft and set union_type to 'apwu'
UPDATE users
SET union_type = 'apwu'
WHERE craft = 'maintenance';

-- Map 'supervisor' to 'other' (supervisors aren't in unions typically)
UPDATE users
SET craft = 'other', union_type = NULL
WHERE craft = 'supervisor';

UPDATE grievances
SET craft = 'other'
WHERE craft = 'supervisor';

-- Step 3: Drop old constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_craft_check;
ALTER TABLE grievances DROP CONSTRAINT IF EXISTS grievances_craft_check;

-- Step 4: Add new constraints for craft
ALTER TABLE users ADD CONSTRAINT users_craft_check
  CHECK (craft IN (
    'city_carrier',
    'cca',
    'rural_carrier',
    'rca',
    'clerk',
    'maintenance',
    'mvs',
    'other'
  ));

ALTER TABLE grievances ADD CONSTRAINT grievances_craft_check
  CHECK (craft IN (
    'city_carrier',
    'cca',
    'rural_carrier',
    'rca',
    'clerk',
    'maintenance',
    'mvs',
    'other'
  ));

-- Step 5: Add constraint for union_type
ALTER TABLE users ADD CONSTRAINT users_union_type_check
  CHECK (union_type IN ('nalc', 'apwu', 'nrlca') OR union_type IS NULL);

-- Step 6: Create index on union_type for better query performance
CREATE INDEX IF NOT EXISTS idx_users_union_type ON users(union_type);
CREATE INDEX IF NOT EXISTS idx_users_craft ON users(craft);

-- Verification queries (comment these out for production use)
-- SELECT craft, union_type, COUNT(*) FROM users GROUP BY craft, union_type;
-- SELECT craft, COUNT(*) FROM grievances GROUP BY craft;

-- Migration complete
SELECT 'Migration completed successfully!' AS status;
