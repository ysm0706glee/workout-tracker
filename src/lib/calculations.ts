import type { Workout } from "@/types/database";

export function calculateStreak(workouts: Workout[]): number {
  if (!workouts.length) return 0;

  const dates = new Set(workouts.map((w) => w.date));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let streak = 0;
  let checkDate: Date;

  if (dates.has(todayStr)) {
    streak = 1;
    checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - 1);
  } else if (dates.has(yesterdayStr)) {
    streak = 1;
    checkDate = new Date(yesterday);
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    return 0;
  }

  while (dates.has(checkDate.toISOString().split("T")[0])) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
}

export function calculateWeekCount(workouts: Workout[]): number {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  return workouts.filter((w) => new Date(w.date) >= weekStart).length;
}

export function calculate1RM(weight: number, reps: number): number {
  return Math.round(weight * (1 + reps / 30));
}

export function calculatePR(
  workouts: Workout[],
  exerciseName: string,
): {
  maxWeight: number;
  maxWeightDate: string;
  maxE1rm: number;
  maxVolume: number;
} {
  let maxWeight = 0;
  let maxWeightDate = "";
  let maxE1rm = 0;
  let maxVolume = 0;

  workouts.forEach((w) => {
    const exercise = w.exercises.find((e) => e.name === exerciseName);
    if (!exercise) return;

    exercise.sets.forEach((s) => {
      if (s.weight > maxWeight) {
        maxWeight = s.weight;
        maxWeightDate = w.date;
      }
      const e1rm = calculate1RM(s.weight, s.reps);
      if (e1rm > maxE1rm) maxE1rm = e1rm;
    });

    const vol = exercise.sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
    if (vol > maxVolume) maxVolume = vol;
  });

  return { maxWeight, maxWeightDate, maxE1rm, maxVolume };
}

export function calculateOverloadSuggestion(
  lastSets: { weight: number; reps: number }[],
  muscleGroup: string | null,
): { weight: number; reps: number } | null {
  if (!lastSets.length) return null;

  // Find the most common weight used (mode)
  const weightCounts = new Map<number, number>();
  for (const s of lastSets) {
    weightCounts.set(s.weight, (weightCounts.get(s.weight) || 0) + 1);
  }
  let mainWeight = 0;
  let maxCount = 0;
  for (const [w, count] of weightCounts) {
    if (count > maxCount || (count === maxCount && w > mainWeight)) {
      mainWeight = w;
      maxCount = count;
    }
  }

  if (mainWeight === 0) return null;

  // Get target reps from the first set at main weight
  const mainSets = lastSets.filter((s) => s.weight === mainWeight);
  const targetReps = mainSets[0].reps;

  // Check if all sets at main weight hit target reps
  const allHitTarget = mainSets.every((s) => s.reps >= targetReps);

  if (allHitTarget) {
    // Progress: increase weight
    const isLegs = muscleGroup === "Legs";
    const increment = isLegs ? 5 : 2.5;
    return {
      weight: mainWeight + increment,
      reps: targetReps,
    };
  }

  // Didn't hit all reps — repeat same weight/reps
  return {
    weight: mainWeight,
    reps: targetReps,
  };
}
