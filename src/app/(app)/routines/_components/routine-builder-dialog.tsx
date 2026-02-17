"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExercisePicker } from "@/components/exercise-picker";
import { createRoutine, updateRoutine } from "../actions";
import { getExerciseDescription } from "@/lib/constants/exercises";
import type { Routine, RoutineExercise } from "@/types/database";

interface RoutineBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routine: Routine | null;
}

export function RoutineBuilderDialog({
  open,
  onOpenChange,
  routine,
}: RoutineBuilderDialogProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [exercises, setExercises] = useState<RoutineExercise[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (open) {
      if (routine) {
        setName(routine.name);
        setExercises(routine.exercises.map((e) => ({ ...e })));
      } else {
        setName("");
        setExercises([]);
      }
    }
  }, [open, routine]);

  function addExercise(exerciseName: string) {
    setExercises([
      ...exercises,
      { name: exerciseName, defaultSets: 3, defaultReps: 10 },
    ]);
  }

  function removeExercise(index: number) {
    setExercises(exercises.filter((_, i) => i !== index));
  }

  function updateExerciseField(
    index: number,
    field: "defaultSets" | "defaultReps",
    value: number,
  ) {
    setExercises(
      exercises.map((e, i) =>
        i === index ? { ...e, [field]: value || 1 } : e,
      ),
    );
  }

  async function handleSave() {
    if (!name.trim()) {
      alert("Give your routine a name.");
      return;
    }
    if (!exercises.length) {
      alert("Add at least one exercise.");
      return;
    }

    if (routine) {
      await updateRoutine(routine.id, name.trim(), exercises);
    } else {
      await createRoutine(name.trim(), exercises);
    }

    onOpenChange(false);
    router.refresh();
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[85vh] max-w-[500px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {routine ? "Edit Routine" : "New Routine"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Routine Name</Label>
              <Input
                placeholder="e.g. Push Day, Leg Day..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <div className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
                Exercises
              </div>
              {exercises.length === 0 ? (
                <div className="py-5 text-center text-muted-foreground">
                  Add exercises to this routine
                </div>
              ) : (
                <div className="space-y-2">
                  {exercises.map((ex, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 rounded-lg border border-border bg-secondary p-3"
                    >
                      <div className="flex-1">
                        <span className="text-sm font-semibold">{ex.name}</span>
                        {(ex.description || getExerciseDescription(ex.name)) && (
                          <p className="text-[11px] leading-snug text-muted-foreground">
                            {ex.description || getExerciseDescription(ex.name)}
                          </p>
                        )}
                      </div>
                      <Input
                        type="number"
                        className="w-[60px] text-center"
                        value={ex.defaultSets}
                        onChange={(e) =>
                          updateExerciseField(
                            i,
                            "defaultSets",
                            parseInt(e.target.value),
                          )
                        }
                        min={1}
                      />
                      <span className="text-xs text-muted-foreground">
                        sets &times;
                      </span>
                      <Input
                        type="number"
                        className="w-[60px] text-center"
                        value={ex.defaultReps}
                        onChange={(e) =>
                          updateExerciseField(
                            i,
                            "defaultReps",
                            parseInt(e.target.value),
                          )
                        }
                        min={1}
                      />
                      <span className="text-xs text-muted-foreground">
                        reps
                      </span>
                      <button
                        onClick={() => removeExercise(i)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-lg text-destructive"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full"
                onClick={() => setPickerOpen(true)}
              >
                + Add Exercise
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSave}>
                Save Routine
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ExercisePicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={addExercise}
        title="Add Exercise to Routine"
      />
    </>
  );
}
