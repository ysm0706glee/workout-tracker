-- Notification preferences on user_profiles
ALTER TABLE user_profiles
  ADD COLUMN target_days_per_week integer DEFAULT 3 CHECK (target_days_per_week BETWEEN 1 AND 7),
  ADD COLUMN notify_missed_target boolean DEFAULT false,
  ADD COLUMN notify_weekly_summary boolean DEFAULT false,
  ADD COLUMN notify_routine_rotation boolean DEFAULT false;

-- Track which routine was used for a workout
ALTER TABLE workouts
  ADD COLUMN routine_id uuid REFERENCES routines(id) ON DELETE SET NULL;

-- Multi-device push subscriptions
CREATE TABLE push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own push subscriptions" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
