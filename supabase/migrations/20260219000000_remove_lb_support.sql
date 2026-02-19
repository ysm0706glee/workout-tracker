-- Remove lb support: standardize everything to kg only

-- Update any existing lb rows
UPDATE workouts SET unit = 'kg' WHERE unit = 'lb';
UPDATE user_preferences SET unit = 'kg' WHERE unit = 'lb';

-- Drop old CHECK constraint and add kg-only constraint
ALTER TABLE user_preferences DROP CONSTRAINT IF EXISTS user_preferences_unit_check;
ALTER TABLE user_preferences ADD CONSTRAINT user_preferences_unit_check CHECK (unit = 'kg');
