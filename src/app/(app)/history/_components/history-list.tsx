"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { HistoryItem } from "./history-item";
import type { Workout } from "@/types/database";

const PAGE_SIZE = 20;

export function HistoryList({ workouts }: { workouts: Workout[] }) {
  const [visible, setVisible] = useState(PAGE_SIZE);

  if (!workouts.length) {
    return <EmptyState message="No workout history yet." />;
  }

  const shown = workouts.slice(0, visible);
  const hasMore = visible < workouts.length;

  return (
    <div className="space-y-2.5">
      {shown.map((w) => (
        <HistoryItem key={w.id} workout={w} />
      ))}
      {hasMore && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setVisible((v) => v + PAGE_SIZE)}
        >
          Load More ({workouts.length - visible} remaining)
        </Button>
      )}
    </div>
  );
}
