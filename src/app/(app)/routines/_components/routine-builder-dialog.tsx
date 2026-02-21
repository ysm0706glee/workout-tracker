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

import { getUserExercises } from "@/app/(app)/exercises/actions";
import type { Routine, RoutineExercise, Exercise } from "@/types/database";

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
  const [name, setName] = useState(routine?.name ?? "");
  const [exercises, setExercises] = useState<RoutineExercise[]>(
    () => routine?.exercises.map((e) => ({ ...e })) ?? [],
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) getUserExercises().then(setCustomExercises);
  }, [open]);

  function addExercise(exerciseName: string) {
    setExercises([
      ...exercises,
      { name: exerciseName, defaultSets: 3, defaultReps: 10 },
    ]);
    setError("");
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
    setError("");
    if (!name.trim()) {
      setError("Give your routine a name.");
      return;
    }
    if (!exercises.length) {
      setError("Add at least one exercise.");
      return;
    }

    setSaving(true);
    try {
      if (routine) {
        await updateRoutine(routine.id, name.trim(), exercises);
      } else {
        await createRoutine(name.trim(), exercises);
      }
      onOpenChange(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
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
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError("");
                }}
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
                  {exercises.map((exercise, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 rounded-lg border border-border bg-secondary p-3"
                    >
                      <div className="flex-1">
                        <span className="text-sm font-semibold">{exercise.name}</span>
                        {exercise.description && (
                          <p className="text-[11px] leading-snug text-muted-foreground">
                            {exercise.description}
                          </p>
                        )}
                      </div>
                      <Input
                        type="number"
                        className="w-[60px] text-center"
                        value={exercise.defaultSets}
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
                        value={exercise.defaultReps}
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

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Routine"}
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
        customExercises={customExercises}
        onExerciseAdded={(ex) => setCustomExercises((prev) => [...prev, ex])}
      />
    </>
  );
}
