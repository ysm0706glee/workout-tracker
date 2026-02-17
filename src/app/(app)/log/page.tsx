"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/empty-state";
import { ExercisePicker } from "@/components/exercise-picker";
import { ExerciseBlock } from "./_components/exercise-block";
import { UnitToggle } from "./_components/unit-toggle";
import {
  saveWorkout,
  getLastPerformance,
  getUserPreferences,
  updateUnit,
  getRoutineById,
} from "./actions";
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

  const [unit, setUnit] = useState<"kg" | "lb">("kg");
  const [exercises, setExercises] = useState<WorkoutExerciseLocal[]>([]);
  const [notes, setNotes] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [savedOffline, setSavedOffline] = useState(false);
  const [lastPerformances, setLastPerformances] = useState<
    Record<string, { sets: { weight: number; reps: number }[]; unit: string; date: string } | null>
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
      const prefs = await getUserPreferences();
      if (prefs?.unit) setUnit(prefs.unit as "kg" | "lb");

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routineId]);

  useEffect(() => {
    exercises.forEach((ex) => loadLastPerformance(ex.name));
  }, [exercises, loadLastPerformance]);

  function handleUnitChange(newUnit: "kg" | "lb") {
    setUnit(newUnit);
    updateUnit(newUnit);
  }

  function addExercise(name: string) {
    setExercises([...exercises, { name, sets: [{ weight: "", reps: "" }] }]);
  }

  function removeExercise(index: number) {
    setExercises(exercises.filter((_, i) => i !== index));
  }

  function updateSet(
    exerciseIndex: number,
    setIndex: number,
    field: "weight" | "reps",
    value: string,
  ) {
    setExercises(
      exercises.map((ex, ei) =>
        ei === exerciseIndex
          ? {
              ...ex,
              sets: ex.sets.map((s, si) =>
                si === setIndex ? { ...s, [field]: value } : s,
              ),
            }
          : ex,
      ),
    );
  }

  function addSet(exerciseIndex: number) {
    setExercises(
      exercises.map((ex, ei) => {
        if (ei !== exerciseIndex) return ex;
        const last = ex.sets.at(-1);
        return {
          ...ex,
          sets: [
            ...ex.sets,
            { weight: last?.weight ?? "", reps: last?.reps ?? "" },
          ],
        };
      }),
    );
  }

  function removeSet(exerciseIndex: number, setIndex: number) {
    setExercises(
      exercises
        .map((ex, ei) => {
          if (ei !== exerciseIndex) return ex;
          const newSets = ex.sets.filter((_, si) => si !== setIndex);
          return { ...ex, sets: newSets };
        })
        .filter((ex) => ex.sets.length > 0),
    );
  }

  function saveToQueue(cleaned: { name: string; sets: { weight: number; reps: number }[] }[]) {
    enqueue({
      exercises: cleaned,
      unit,
      notes: notes.trim(),
      date: new Date().toISOString().split("T")[0],
    });
    setSavedOffline(true);
    setExercises([]);
    setNotes("");
    setTimeout(() => setSavedOffline(false), 3000);
  }

  async function handleSave() {
    const valid = exercises.filter((ex) =>
      ex.sets.some((s) => s.weight && s.reps),
    );
    if (!valid.length) {
      alert("Add at least one exercise with weight and reps.");
      return;
    }

    const cleaned = valid.map((ex) => ({
      name: ex.name,
      sets: ex.sets
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
      await saveWorkout(cleaned, unit, notes.trim());
      router.push("/dashboard");
    } catch {
      // Network failure — save to offline queue
      saveToQueue(cleaned);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <UnitToggle unit={unit} onUnitChange={handleUnitChange} />

      {exercises.length === 0 ? (
        <EmptyState message="Add an exercise to begin" />
      ) : (
        exercises.map((ex, i) => (
          <ExerciseBlock
            key={`${ex.name}-${i}`}
            name={ex.name}
            sets={ex.sets}
            unit={unit}
            lastPerformance={lastPerformances[ex.name] ?? null}
            onUpdateSet={(si, field, val) => updateSet(i, si, field, val)}
            onAddSet={() => addSet(i)}
            onRemoveSet={(si) => removeSet(i, si)}
            onRemoveExercise={() => removeExercise(i)}
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

      <ExercisePicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={addExercise}
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
