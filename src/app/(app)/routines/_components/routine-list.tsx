"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { RoutineCard } from "./routine-card";
import { RoutineBuilderDialog } from "./routine-builder-dialog";
import type { Routine } from "@/types/database";
import { Sparkles } from "lucide-react";

export function RoutineList({ routines }: { routines: Routine[] }) {
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);

  function handleEdit(routine: Routine) {
    setEditingRoutine(routine);
    setBuilderOpen(true);
  }

  function handleCreate() {
    setEditingRoutine(null);
    setBuilderOpen(true);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">My Routines</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href="/routines/generate">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              AI Generate
            </Link>
          </Button>
          <Button size="sm" onClick={handleCreate}>
            + New Routine
          </Button>
        </div>
      </div>

      {routines.length === 0 ? (
        <EmptyState message="No routines yet. Create your first routine to speed up logging at the gym!" />
      ) : (
        <div className="space-y-3">
          {routines.map((r) => (
            <RoutineCard key={r.id} routine={r} onEdit={handleEdit} />
          ))}
        </div>
      )}

      <RoutineBuilderDialog
        key={editingRoutine?.id ?? "new"}
        open={builderOpen}
        onOpenChange={setBuilderOpen}
        routine={editingRoutine}
      />
    </div>
  );
}
