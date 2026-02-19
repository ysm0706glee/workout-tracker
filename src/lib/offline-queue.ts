import type { WorkoutExercise } from "@/types/database";

const STORAGE_KEY = "ironlog_offline_queue";

export interface QueuedWorkout {
  localId: string;
  exercises: WorkoutExercise[];
  unit: "kg";
  notes: string;
  date: string;
  queuedAt: string;
}

export function getQueue(): QueuedWorkout[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function enqueue(workout: Omit<QueuedWorkout, "localId" | "queuedAt">) {
  const queue = getQueue();
  queue.push({
    ...workout,
    localId: crypto.randomUUID(),
    queuedAt: new Date().toISOString(),
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export function dequeue(localId: string) {
  const queue = getQueue().filter((w) => w.localId !== localId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export function getQueueCount(): number {
  return getQueue().length;
}

export function clearQueue() {
  localStorage.removeItem(STORAGE_KEY);
}
