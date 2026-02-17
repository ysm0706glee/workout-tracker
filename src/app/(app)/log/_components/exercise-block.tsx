"use client";

import { Button } from "@/components/ui/button";
import { SetRow } from "./set-row";
import { LastPerformance } from "./last-performance";

interface SetData {
  weight: string;
  reps: string;
}

interface ExerciseBlockProps {
  name: string;
  sets: SetData[];
  unit: string;
  lastPerformance: {
    sets: { weight: number; reps: number }[];
    unit: string;
    date: string;
  } | null;
  onUpdateSet: (setIndex: number, field: "weight" | "reps", value: string) => void;
  onAddSet: () => void;
  onRemoveSet: (setIndex: number) => void;
  onRemoveExercise: () => void;
}

export function ExerciseBlock({
  name,
  sets,
  unit,
  lastPerformance,
  onUpdateSet,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
}: ExerciseBlockProps) {
  return (
    <div className="mb-3 rounded-[14px] border border-border bg-secondary p-4">
      <div className="mb-1 flex items-center justify-between">
        <div className="text-[16px] font-semibold">{name}</div>
        <Button size="sm" variant="destructive" onClick={onRemoveExercise}>
          Skip
        </Button>
      </div>

      {lastPerformance && (
        <LastPerformance
          sets={lastPerformance.sets}
          unit={lastPerformance.unit}
          date={lastPerformance.date}
        />
      )}

      <div className="mb-1.5 grid grid-cols-[40px_1fr_1fr_40px] gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
        <span></span>
        <span className="text-center">{unit}</span>
        <span className="text-center">Reps</span>
        <span></span>
      </div>

      {sets.map((set, i) => (
        <SetRow
          key={i}
          index={i}
          weight={set.weight}
          reps={set.reps}
          unit={unit}
          onWeightChange={(v) => onUpdateSet(i, "weight", v)}
          onRepsChange={(v) => onUpdateSet(i, "reps", v)}
          onRemove={() => onRemoveSet(i)}
        />
      ))}

      <Button
        variant="outline"
        size="sm"
        className="mt-2 w-full"
        onClick={onAddSet}
      >
        + Add Set
      </Button>
    </div>
  );
}
