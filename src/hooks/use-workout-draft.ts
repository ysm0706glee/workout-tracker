"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { saveDraft, loadDraft, clearDraft, type DraftData } from "@/lib/draft-db";

interface SetData {
  weight: string;
  reps: string;
}

interface WorkoutExerciseLocal {
  name: string;
  sets: SetData[];
}

interface UseWorkoutDraftReturn {
  /** Draft loaded from IndexedDB (null if none) */
  draft: DraftData | null;
  /** Whether a draft was found on mount */
  hasDraft: boolean;
  /** Clear the draft (after save or discard) */
  clearSavedDraft: () => Promise<void>;
}

function hasContent(exercises: WorkoutExerciseLocal[]): boolean {
  return exercises.some(
    (ex) =>
      ex.name &&
      ex.sets.some((s) => s.weight !== "" || s.reps !== "")
  );
}

export function useWorkoutDraft(
  exercises: WorkoutExerciseLocal[],
  notes: string
): UseWorkoutDraftReturn {
  const [draft, setDraft] = useState<DraftData | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const draftLoaded = useRef(false);
  const initialLoadDone = useRef(false);

  // Load draft on mount
  useEffect(() => {
    if (draftLoaded.current) return;
    draftLoaded.current = true;

    loadDraft().then((loaded) => {
      if (loaded && loaded.exercises.length > 0) {
        setDraft(loaded);
        setHasDraft(true);
      }
      initialLoadDone.current = true;
    });
  }, []);

  // Auto-save with debounce
  useEffect(() => {
    if (!initialLoadDone.current) return;

    const timer = setTimeout(() => {
      if (hasContent(exercises)) {
        saveDraft({
          exercises,
          notes,
          updatedAt: new Date().toISOString(),
        });
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [exercises, notes]);

  const clearSavedDraft = useCallback(async () => {
    await clearDraft();
    setDraft(null);
    setHasDraft(false);
  }, []);

  return { draft, hasDraft, clearSavedDraft };
}
