"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { deleteRoutine } from "../actions";
import type { Routine } from "@/types/database";

export function RoutineCard({
  routine,
  onEdit,
}: {
  routine: Routine;
  onEdit: (r: Routine) => void;
}) {
  const router = useRouter();

  const exList = routine.exercises
    .map((e) => `${e.name} (${e.defaultSets}\u00D7${e.defaultReps})`)
    .join(", ");

  async function handleDelete() {
    if (!confirm("Delete this routine?")) return;
    await deleteRoutine(routine.id);
    router.refresh();
  }

  function handleStart() {
    router.push(`/log?routineId=${routine.id}`);
  }

  return (
    <Card className="transition-colors hover:border-primary">
      <CardContent className="p-[18px]">
        <div className="mb-1.5 flex items-start justify-between">
          <div className="text-[17px] font-bold">{routine.name}</div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-red-400"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="mb-3 text-[13px] leading-relaxed text-muted-foreground">
          {exList}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="default" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleStart}>
            Start
          </Button>
          <Button size="sm" variant="outline" onClick={() => onEdit(routine)}>
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
