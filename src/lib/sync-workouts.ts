import { getQueue, dequeue } from "./offline-queue";
import { syncWorkout } from "@/app/(app)/log/actions";

export async function syncPendingWorkouts(): Promise<number> {
  const queue = getQueue();
  if (queue.length === 0) return 0;

  let synced = 0;
  for (const item of queue) {
    try {
      await syncWorkout(
        item.localId,
        item.exercises,
        item.unit,
        item.notes,
        item.date,
      );
      dequeue(item.localId);
      synced++;
    } catch {
      // Stop on first failure — likely still offline or auth issue
      break;
    }
  }
  return synced;
}
