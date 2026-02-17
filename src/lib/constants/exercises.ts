export function getExerciseMuscleGroup(name: string): string | null {
  for (const [group, exercises] of Object.entries(DEFAULT_EXERCISES)) {
    if (exercises.includes(name)) return group;
  }
  return null;
}

export const DEFAULT_EXERCISES: Record<string, string[]> = {
  Chest: [
    "Bench Press",
    "Incline Bench Press",
    "Dumbbell Fly",
    "Cable Crossover",
    "Push-Up",
    "Dumbbell Press",
  ],
  Back: [
    "Deadlift",
    "Barbell Row",
    "Lat Pulldown",
    "Seated Cable Row",
    "Pull-Up",
    "T-Bar Row",
  ],
  Shoulders: [
    "Overhead Press",
    "Lateral Raise",
    "Front Raise",
    "Face Pull",
    "Arnold Press",
    "Reverse Fly",
  ],
  Arms: [
    "Barbell Curl",
    "Dumbbell Curl",
    "Hammer Curl",
    "Tricep Pushdown",
    "Skull Crusher",
    "Dip",
  ],
  Legs: [
    "Squat",
    "Leg Press",
    "Romanian Deadlift",
    "Leg Curl",
    "Leg Extension",
    "Calf Raise",
    "Lunge",
    "Bulgarian Split Squat",
  ],
  Core: [
    "Plank",
    "Cable Crunch",
    "Hanging Leg Raise",
    "Ab Wheel Rollout",
    "Russian Twist",
  ],
};
