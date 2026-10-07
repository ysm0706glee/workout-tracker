"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { SetRow } from "./set-row";
import { LastPerformance } from "./last-performance";
import { OverloadSuggestion } from "./overload-suggestion";
import { ArrowRightLeft, Trash2 } from "lucide-react";

interface SetData {
  weight: string;
  reps: string;
}

interface ExerciseBlockProps {
  name: string;
  description?: string | null;
  sets: SetData[];
  lastPerformance: {
    sets: { weight: number; reps: number }[];
    date: string;
  } | null;
  suggestion?: { weight: number; reps: number } | null;
  index: number;
  onUpdateSet: (
    exerciseIndex: number,
    setIndex: number,
    field: "weight" | "reps",
    value: string,
  ) => void;
  onAddSet: (exerciseIndex: number) => void;
  onRemoveSet: (exerciseIndex: number, setIndex: number) => void;
  onRemoveExercise: (exerciseIndex: number) => void;
  onSwapExercise?: (exerciseIndex: number) => void;
  onApplySuggestion?: (
    exerciseIndex: number,
    suggestion: { weight: number; reps: number },
  ) => void;
}

export const ExerciseBlock = memo(function ExerciseBlock({
  name,
  index,
  description,
  sets,
  lastPerformance,
  suggestion,
  onUpdateSet,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
  onSwapExercise,
  onApplySuggestion,
}: ExerciseBlockProps) {
  return (
    <div className="mb-3 rounded-[14px] border border-border bg-secondary p-4">
      <div className="mb-1 flex items-center justify-between">
        <div className="text-[16px] font-semibold">{name}</div>
        <div className="flex gap-1.5">
          {onSwapExercise && (
            <Button size="sm" variant="ghost" onClick={() => onSwapExercise(index)}>
              <ArrowRightLeft className="mr-1 h-3.5 w-3.5" />
              Swap
            </Button>
          )}
          <Button size="sm" variant="destructive" onClick={() => onRemoveExercise(index)}>
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            Remove
          </Button>
        </div>
      </div>
      {description && (
        <p className="mb-2 text-[12px] leading-snug text-muted-foreground">
          {description}
        </p>
      )}

      {lastPerformance && (
        <LastPerformance
          sets={lastPerformance.sets}
          date={lastPerformance.date}
        />
      )}

      {suggestion && onApplySuggestion && (
        <OverloadSuggestion
          weight={suggestion.weight}
          reps={suggestion.reps}
          onApply={() => onApplySuggestion(index, suggestion)}
        />
      )}

      <div className="mb-1.5 grid grid-cols-[40px_1fr_1fr_40px] gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
        <span></span>
        <span className="text-center">kg</span>
        <span className="text-center">Reps</span>
        <span></span>
      </div>

      {sets.map((set, i) => (
        <SetRow
          key={i}
          index={i}
          weight={set.weight}
          reps={set.reps}
          onWeightChange={(v) => onUpdateSet(index, i, "weight", v)}
          onRepsChange={(v) => onUpdateSet(index, i, "reps", v)}
          onRemove={() => onRemoveSet(index, i)}
        />
      ))}

      <Button
        variant="outline"
        size="sm"
        className="mt-2 w-full"
        onClick={() => onAddSet(index)}
      >
        + Add Set
      </Button>
    </div>
  );
});
