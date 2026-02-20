-- Simplify fitness goals: drop 'endurance', keep strength/hypertrophy/general
UPDATE user_profiles SET fitness_goal = 'general' WHERE fitness_goal = 'endurance';
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_fitness_goal_check;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_fitness_goal_check
  CHECK (fitness_goal IN ('strength', 'hypertrophy', 'general'));

-- Convert equipment from text to text[] (multi-select)
-- First migrate existing data to a temp column
ALTER TABLE user_profiles ADD COLUMN equipment_new text[];

UPDATE user_profiles SET equipment_new = CASE
  WHEN equipment = 'full_gym'   THEN ARRAY['barbell','dumbbells','machines','cables']
  WHEN equipment = 'dumbbells'  THEN ARRAY['dumbbells']
  WHEN equipment = 'home_gym'   THEN ARRAY['barbell','dumbbells']
  WHEN equipment = 'bodyweight' THEN ARRAY['bodyweight']
  ELSE NULL
END;

ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_equipment_check;
ALTER TABLE user_profiles DROP COLUMN equipment;
ALTER TABLE user_profiles RENAME COLUMN equipment_new TO equipment;

-- Add check constraint to validate array values
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_equipment_check
  CHECK (equipment IS NULL OR equipment <@ ARRAY['barbell','dumbbells','machines','cables','bodyweight']::text[]);
