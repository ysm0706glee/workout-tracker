"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/empty-state";
import { ExercisePicker } from "@/components/exercise-picker";
import { ExerciseBlock } from "./_components/exercise-block";
import {
  saveWorkout,
  getLastPerformance,
  getRoutineById,
} from "./actions";
import { calculateOverloadSuggestion } from "@/lib/calculations";
import { getExerciseMuscleGroup } from "@/lib/constants/exercises";
import type { RoutineExercise } from "@/types/database";
import { Plus, WifiOff } from "lucide-react";
import { enqueue } from "@/lib/offline-queue";
import { syncPendingWorkouts } from "@/lib/sync-workouts";
import { getQueueCount } from "@/lib/offline-queue";

interface SetData {
  weight: string;
  reps: string;
}

interface WorkoutExerciseLocal {
  name: string;
  sets: SetData[];
}

function LogPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const routineId = searchParams.get("routineId");

  const [exercises, setExercises] = useState<WorkoutExerciseLocal[]>([]);
  const [notes, setNotes] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [savedOffline, setSavedOffline] = useState(false);
  const [swapTarget, setSwapTarget] = useState<number | null>(null);
  const [lastPerformances, setLastPerformances] = useState<
    Record<string, { sets: { weight: number; reps: number }[]; date: string } | null>
  >({});

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const goOffline = () => setIsOffline(true);
    const goOnline = () => {
      setIsOffline(false);
      if (getQueueCount() > 0) {
        syncPendingWorkouts();
      }
    };
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  const loadLastPerformance = useCallback(async (exerciseName: string) => {
    if (lastPerformances[exerciseName] !== undefined) return;
    const result = await getLastPerformance(exerciseName);
    setLastPerformances((prev) => ({ ...prev, [exerciseName]: result }));
  }, [lastPerformances]);

  useEffect(() => {
    async function init() {
      if (routineId) {
        const routine = await getRoutineById(routineId);
        if (routine) {
          const routineExercises = routine.exercises as RoutineExercise[];
          setExercises(
            routineExercises.map((e) => ({
              name: e.name,
              sets: Array.from({ length: e.defaultSets || 3 }, () => ({
                weight: "",
                reps: e.defaultReps ? String(e.defaultReps) : "",
              })),
            })),
          );
        }
      }
    }
    init();
  }, [routineId]);

  useEffect(() => {
    exercises.forEach((exercise) => loadLastPerformance(exercise.name));
  }, [exercises, loadLastPerformance]);

  // Compute overload suggestions for each exercise
  const suggestions = useMemo(() => {
    const result: Record<string, { weight: number; reps: number } | null> = {};
    for (const exercise of exercises) {
      const perf = lastPerformances[exercise.name];
      if (perf) {
        const muscleGroup = getExerciseMuscleGroup(exercise.name);
        result[exercise.name] = calculateOverloadSuggestion(
          perf.sets,
          muscleGroup,
        );
      } else {
        result[exercise.name] = null;
      }
    }
    return result;
  }, [exercises, lastPerformances]);

  function addExercise(name: string) {
    setExercises([...exercises, { name, sets: [{ weight: "", reps: "" }] }]);
  }

  function removeExercise(index: number) {
    setExercises(exercises.filter((_, i) => i !== index));
  }

  function swapExercise(index: number, newName: string) {
    setExercises(
      exercises.map((exercise, i) =>
        i === index ? { ...exercise, name: newName } : exercise,
      ),
    );
  }

  function handleSwapSelect(name: string) {
    if (swapTarget !== null) {
      swapExercise(swapTarget, name);
      setSwapTarget(null);
    }
  }

  function applySuggestion(exerciseIndex: number) {
    const target = exercises[exerciseIndex];
    const suggestion = suggestions[target.name];
    if (!suggestion) return;

    setExercises(
      exercises.map((e, ei) => {
        if (ei !== exerciseIndex) return e;
        return {
          ...e,
          sets: e.sets.map((s) => ({
            weight: s.weight || String(suggestion.weight),
            reps: s.reps || String(suggestion.reps),
          })),
        };
      }),
    );
  }

  function updateSet(
    exerciseIndex: number,
    setIndex: number,
    field: "weight" | "reps",
    value: string,
  ) {
    setExercises(
      exercises.map((exercise, ei) =>
        ei === exerciseIndex
          ? {
              ...exercise,
              sets: exercise.sets.map((s, si) =>
                si === setIndex ? { ...s, [field]: value } : s,
              ),
            }
          : exercise,
      ),
    );
  }

  function addSet(exerciseIndex: number) {
    setExercises(
      exercises.map((exercise, ei) => {
        if (ei !== exerciseIndex) return exercise;
        const last = exercise.sets.at(-1);
        return {
          ...exercise,
          sets: [
            ...exercise.sets,
            { weight: last?.weight ?? "", reps: last?.reps ?? "" },
          ],
        };
      }),
    );
  }

  function removeSet(exerciseIndex: number, setIndex: number) {
    setExercises(
      exercises
        .map((exercise, ei) => {
          if (ei !== exerciseIndex) return exercise;
          const newSets = exercise.sets.filter((_, si) => si !== setIndex);
          return { ...exercise, sets: newSets };
        })
        .filter((exercise) => exercise.sets.length > 0),
    );
  }

  function saveToQueue(cleaned: { name: string; sets: { weight: number; reps: number }[] }[]) {
    enqueue({
      exercises: cleaned,
      unit: "kg",
      notes: notes.trim(),
      date: new Date().toISOString().split("T")[0],
    });
    setSavedOffline(true);
    setExercises([]);
    setNotes("");
    setTimeout(() => setSavedOffline(false), 3000);
  }

  async function handleSave() {
    const valid = exercises.filter((exercise) =>
      exercise.sets.some((s) => s.weight && s.reps),
    );
    if (!valid.length) {
      alert("Add at least one exercise with weight and reps.");
      return;
    }

    const cleaned = valid.map((exercise) => ({
      name: exercise.name,
      sets: exercise.sets
        .filter((s) => s.weight && s.reps)
        .map((s) => ({
          weight: parseFloat(s.weight),
          reps: parseInt(s.reps),
        })),
    }));

    if (isOffline) {
      saveToQueue(cleaned);
      return;
    }

    setSaving(true);
    try {
      await saveWorkout(cleaned, notes.trim());
      router.push("/dashboard");
    } catch {
      // Network failure — save to offline queue
      saveToQueue(cleaned);
    } finally {
      setSaving(false);
    }
  }

  // Get the muscle group for the swap picker filter
  const swapFilterGroup =
    swapTarget !== null
      ? getExerciseMuscleGroup(exercises[swapTarget]?.name) ?? undefined
      : undefined;

  return (
    <div>
      {exercises.length === 0 ? (
        <EmptyState message="Add an exercise to begin" />
      ) : (
        exercises.map((exercise, i) => (
          <ExerciseBlock
            key={`${exercise.name}-${i}`}
            name={exercise.name}
            sets={exercise.sets}
            lastPerformance={lastPerformances[exercise.name] ?? null}
            suggestion={suggestions[exercise.name] ?? null}
            onUpdateSet={(si, field, val) => updateSet(i, si, field, val)}
            onAddSet={() => addSet(i)}
            onRemoveSet={(si) => removeSet(i, si)}
            onRemoveExercise={() => removeExercise(i)}
            onSwapExercise={() => setSwapTarget(i)}
            onApplySuggestion={() => applySuggestion(i)}
          />
        ))
      )}

      <Button
        variant="outline"
        className="mb-3 w-full"
        onClick={() => setPickerOpen(true)}
      >
        <Plus className="mr-2 h-[18px] w-[18px]" />
        Add Exercise
      </Button>

      <div className="mb-4 space-y-2">
        <Label>Notes (optional)</Label>
        <Textarea
          placeholder="How did it feel?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {savedOffline && (
        <div className="mb-3 rounded-md bg-yellow-600/20 px-4 py-2 text-center text-sm text-yellow-400">
          <WifiOff className="mr-1 inline h-4 w-4" />
          Saved offline — will sync when back online
        </div>
      )}

      <Button className="w-full" onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : isOffline ? "Save Offline" : "Save Workout"}
      </Button>

      {/* Add exercise picker */}
      <ExercisePicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={addExercise}
      />

      {/* Swap exercise picker (filtered by muscle group) */}
      <ExercisePicker
        open={swapTarget !== null}
        onOpenChange={(open) => {
          if (!open) setSwapTarget(null);
        }}
        onSelect={handleSwapSelect}
        title="Swap Exercise"
        filterGroup={swapFilterGroup}
      />
    </div>
  );
}

export default function LogPage() {
  return (
    <Suspense>
      <LogPageInner />
    </Suspense>
  );
}
