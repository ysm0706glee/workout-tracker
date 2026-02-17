import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { formatDate } from "@/lib/utils";
import type { Workout } from "@/types/database";

export function RecentWorkouts({ workouts }: { workouts: Workout[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-[13px] uppercase tracking-wider text-muted-foreground">
          Recent Workouts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!workouts.length ? (
          <EmptyState message="No workouts yet. Tap + to begin!" />
        ) : (
          <div className="space-y-2.5">
            {workouts.map((w) => {
              const names = w.exercises.map((e) => e.name).join(", ");
              const sets = w.exercises.reduce(
                (s, e) => s + e.sets.length,
                0,
              );
              return (
                <div
                  key={w.id}
                  className="rounded-[14px] border border-border bg-card p-4"
                >
                  <div className="text-[13px] font-semibold text-[#a29bfe]">
                    {formatDate(w.date)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {names} &middot; {sets} sets
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
