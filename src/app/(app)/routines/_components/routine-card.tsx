"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteRoutine } from "../actions";
import { toast } from "sonner";
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
    .map((e) => `${e.name} (${e.defaultSets}×${e.defaultReps})`)
    .join(", ");

  async function handleDelete() {
    await deleteRoutine(routine.id);
    toast.success("Routine deleted");
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete routine?</AlertDialogTitle>
                <AlertDialogDescription>
                  &ldquo;{routine.name}&rdquo; will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
