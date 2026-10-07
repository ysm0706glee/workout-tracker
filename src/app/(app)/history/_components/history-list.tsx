"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { toast } from "sonner";
import { HistoryItem } from "./history-item";
import { getWorkoutsPage } from "../actions";
import type { WorkoutSummary } from "@/types/database";

export function HistoryList({
  workouts,
  total,
}: {
  workouts: WorkoutSummary[];
  total: number;
}) {
  // Pages fetched after the server-rendered first page
  const [extra, setExtra] = useState<WorkoutSummary[]>([]);
  const [isPending, startTransition] = useTransition();

  if (!workouts.length) {
    return <EmptyState message="No workout history yet." />;
  }

  // The first page shifts after a delete + refresh, so drop any overlap
  const firstPageIds = new Set(workouts.map((w) => w.id));
  const shown = [...workouts, ...extra.filter((w) => !firstPageIds.has(w.id))];
  const remaining = total - shown.length;

  function loadMore() {
    startTransition(async () => {
      try {
        const page = await getWorkoutsPage(shown.length);
        setExtra((prev) => {
          const seen = new Set(prev.map((w) => w.id));
          return [...prev, ...page.workouts.filter((w) => !seen.has(w.id))];
        });
      } catch {
        toast.error("Failed to load more workouts.");
      }
    });
  }

  return (
    <div className="space-y-2.5">
      {shown.map((w) => (
        <HistoryItem
          key={w.id}
          workout={w}
          onDeleted={() =>
            setExtra((prev) => prev.filter((e) => e.id !== w.id))
          }
        />
      ))}
      {remaining > 0 && (
        <Button
          variant="outline"
          className="w-full"
          onClick={loadMore}
          disabled={isPending}
        >
          {isPending ? "Loading..." : `Load More (${remaining} remaining)`}
        </Button>
      )}
    </div>
  );
}
