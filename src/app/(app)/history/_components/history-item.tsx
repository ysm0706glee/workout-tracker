"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { deleteWorkout } from "../actions";
import type { Workout } from "@/types/database";

export function HistoryItem({ workout }: { workout: Workout }) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  const names = workout.exercises.map((e) => e.name).join(", ");
  const totalSets = workout.exercises.reduce(
    (s, e) => s + e.sets.length,
    0,
  );
  const u = "kg";

  async function handleDelete() {
    if (!confirm("Delete this workout?")) return;
    await deleteWorkout(workout.id);
    router.refresh();
  }

  return (
    <Card
      className="cursor-pointer transition-colors hover:border-primary"
      onClick={() => setExpanded(!expanded)}
    >
      <CardContent className="p-4">
        <div className="text-[13px] font-semibold text-[#a29bfe]">
          {formatDate(workout.date)}
        </div>
        <div className="text-sm text-muted-foreground">
          {names} &middot; {totalSets} sets
        </div>

        {expanded && (
          <div className="mt-2.5 border-t border-border pt-2.5">
            {workout.exercises.map((exercise, i) => (
              <div key={i} className="mb-2">
                <div className="text-sm font-semibold">{exercise.name}</div>
                {exercise.sets.map((s, si) => (
                  <div
                    key={si}
                    className="pl-3 text-[13px] text-muted-foreground"
                  >
                    Set {si + 1}: {s.weight}
                    {u} &times; {s.reps}
                  </div>
                ))}
              </div>
            ))}
            {workout.notes && (
              <div className="mt-2 text-[13px] italic text-muted-foreground">
                &ldquo;{workout.notes}&rdquo;
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="mt-2 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive"
            >
              Delete Workout
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
