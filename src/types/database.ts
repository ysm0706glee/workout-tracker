export interface WorkoutSet {
  weight: number;
  reps: number;
}

export interface WorkoutExercise {
  name: string;
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  user_id: string;
  local_id: string | null;
  routine_id: string | null;
  date: string;
  unit: "kg";
  exercises: WorkoutExercise[];
  notes: string | null;
  created_at: string;
}

export interface RoutineExercise {
  name: string;
  defaultSets: number;
  defaultReps: number;
  description?: string;
}

export interface Routine {
  id: string;
  user_id: string;
  local_id: string | null;
  name: string;
  exercises: RoutineExercise[];
  created_at: string;
  updated_at: string;
}

export interface UserPreference {
  id: string;
  user_id: string;
  unit: "kg";
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  fitness_goal: "strength" | "hypertrophy" | "general" | null;
  experience: "beginner" | "intermediate" | "advanced" | null;
  equipment:
    | ("barbell" | "dumbbells" | "machines" | "cables" | "bodyweight")[]
    | null;
  target_days_per_week: number | null;
  notify_missed_target: boolean;
  notify_weekly_summary: boolean;
  notify_routine_rotation: boolean;
  created_at: string;
  updated_at: string;
}

export interface PushSubscriptionRecord {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}

export interface Exercise {
  id: string;
  user_id: string;
  muscle_group: string;
  name: string;
  created_at: string;
}
