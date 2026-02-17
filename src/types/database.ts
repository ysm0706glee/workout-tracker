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
  unit: "kg" | "lb";
  exercises: WorkoutExercise[];
  notes: string | null;
  created_at: string;
}

export interface RoutineExercise {
  name: string;
  defaultSets: number;
  defaultReps: number;
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
  unit: "kg" | "lb";
  created_at: string;
  updated_at: string;
}
