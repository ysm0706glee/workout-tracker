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
  fitness_goal: "strength" | "hypertrophy" | "endurance" | "general" | null;
  experience: "beginner" | "intermediate" | "advanced" | null;
  equipment: "full_gym" | "dumbbells" | "home_gym" | "bodyweight" | null;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: string;
  user_id: string;
  muscle_group: string;
  name: string;
  created_at: string;
}
