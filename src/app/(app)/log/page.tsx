"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { toast } from "sonner";
import { ExercisePicker } from "@/components/exercise-picker";
import { ExerciseBlock } from "./_components/exercise-block";
import {
  saveWorkout,
  getLastPerformance,
  getRoutineById,
} from "./actions";
import { calculateOverloadSuggestion } from "@/lib/calculations";
import { getExerciseMuscleGroup } from "@/lib/constants/exercises";
import type { RoutineExercise, Exercise } from "@/types/database";
import { Plus, WifiOff, RotateCcw, X, Check } from "lucide-react";
import { getUserExercises } from "@/app/(app)/exercises/actions";
import { enqueue } from "@/lib/offline-queue";
import { syncPendingWorkouts } from "@/lib/sync-workouts";
import { getQueueCount } from "@/lib/offline-queue";
import { useWorkoutDraft } from "@/hooks/use-workout-draft";

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

  const [isInitializing, setIsInitializing] = useState(true);
  const [exercises, setExercises] = useState<WorkoutExerciseLocal[]>([]);
  const [notes, setNotes] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [savedOffline, setSavedOffline] = useState(false);
  const [swapTarget, setSwapTarget] = useState<number | null>(null);
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  const [lastPerformances, setLastPerformances] = useState<
    Record<string, { sets: { weight: number; reps: number }[]; date: string } | null>
  >({});

  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const { draft, hasDraft, lastSaved, clearSavedDraft } = useWorkoutDraft(exercises, notes, showDraftBanner);

  // Show draft banner whenever a draft is detected
  useEffect(() => {
    if (hasDraft) {
      setShowDraftBanner(true);
    }
  }, [hasDraft]);

  function resumeDraft() {
    if (!draft) return;
    setExercises(draft.exercises);
    setNotes(draft.notes);
    setShowDraftBanner(false);
  }

  function discardDraft() {
    clearSavedDraft();
    setShowDraftBanner(false);
  }

  // Warn before closing tab with unsaved data
  useEffect(() => {
    const hasData = exercises.some(
      (ex) => ex.name && ex.sets.some((s) => s.weight !== "" || s.reps !== "")
    );
    if (!hasData) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [exercises]);

  useEffect(() => {
    async function init() {
      const [customExs] = await Promise.all([
        getUserExercises(),
        routineId
          ? getRoutineById(routineId).then((routine) => {
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
            })
          : Promise.resolve(),
      ]);
      setCustomExercises(customExs);
      setIsInitializing(false);
    }
    init();
  }, [routineId]);

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
    clearSavedDraft();
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
      toast.error("Add at least one exercise with weight and reps.");
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
      await saveWorkout(cleaned, notes.trim(), routineId);
      await clearSavedDraft();
      toast.success("Workout saved!");
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

  if (isInitializing) {
    return <LogSkeleton />;
  }

  return (
    <div>
      {showDraftBanner && draft && (
        <div className="mb-4 rounded-lg border border-[#6c5ce7]/30 bg-[#6c5ce7]/10 p-4">
          <p className="mb-3 text-sm text-[#a8a8b8]">
            You have an unsaved workout from{" "}
            {new Date(draft.updatedAt).toLocaleString()}.{" "}
            {draft.exercises.length} exercise{draft.exercises.length !== 1 ? "s" : ""}.
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={resumeDraft}>
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Resume
            </Button>
            <Button size="sm" variant="ghost" onClick={discardDraft}>
              <X className="mr-1.5 h-3.5 w-3.5" />
              Discard
            </Button>
          </div>
        </div>
      )}

      {exercises.length === 0 && !showDraftBanner ? (
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

      {lastSaved && !savedOffline && (
        <p className="mb-2 flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <Check className="h-3 w-3 text-green-500" />
          Draft saved
        </p>
      )}

      <Button className="w-full" onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : isOffline ? "Save Offline" : "Save Workout"}
      </Button>

      {/* Add exercise picker */}
      <ExercisePicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={addExercise}
        customExercises={customExercises}
        onExerciseAdded={(ex) => setCustomExercises((prev) => [...prev, ex])}
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
        customExercises={customExercises}
        onExerciseAdded={(ex) => setCustomExercises((prev) => [...prev, ex])}
      />
    </div>
  );
}

function LogSkeleton() {
  return (
    <div>
      <Skeleton className="mb-3 h-[120px] rounded-[14px]" />
      <Skeleton className="mb-3 h-12 w-full rounded-lg" />
      <Skeleton className="mb-4 h-24 w-full rounded-lg" />
      <Skeleton className="h-11 w-full rounded-lg" />
    </div>
  );
}

export default function LogPage() {
  return (
    <Suspense fallback={<LogSkeleton />}>
      <LogPageInner />
    </Suspense>
  );
}
