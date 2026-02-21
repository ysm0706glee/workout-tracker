"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { cn, formatDate } from "@/lib/utils";
import { deleteWorkout } from "../actions";
import { toast } from "sonner";
import type { Workout } from "@/types/database";

export function HistoryItem({ workout }: { workout: Workout }) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  const names = workout.exercises.map((e) => e.name).join(", ");
  const totalSets = workout.exercises.reduce(
    (s, e) => s + e.sets.length,
    0,
  );

  async function handleDelete() {
    await deleteWorkout(workout.id);
    toast.success("Workout deleted");
    router.refresh();
  }

  return (
    <Card
      className="cursor-pointer transition-colors hover:border-primary"
      onClick={() => setExpanded(!expanded)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[13px] font-semibold text-[#a29bfe]">
              {formatDate(workout.date)}
            </div>
            <div className="text-sm text-muted-foreground">
              {names} &middot; {totalSets} sets
            </div>
          </div>
          <div className="flex items-center gap-1">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-red-400"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete workout?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {formatDate(workout.date)} &middot; {totalSets} sets. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                expanded && "rotate-180",
              )}
            />
          </div>
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
                    kg &times; {s.reps}
                  </div>
                ))}
              </div>
            ))}
            {workout.notes && (
              <div className="mt-2 text-[13px] italic text-muted-foreground">
                &ldquo;{workout.notes}&rdquo;
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
