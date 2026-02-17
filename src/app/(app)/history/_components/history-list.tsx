import { EmptyState } from "@/components/empty-state";
import { HistoryItem } from "./history-item";
import type { Workout } from "@/types/database";

export function HistoryList({ workouts }: { workouts: Workout[] }) {
  if (!workouts.length) {
    return <EmptyState message="No workout history yet." />;
  }

  return (
    <div className="space-y-2.5">
      {workouts.map((w) => (
        <HistoryItem key={w.id} workout={w} />
      ))}
    </div>
  );
}
