"use client";

import { useState, useMemo } from "react";
import { EmptyState } from "@/components/empty-state";
import { ExerciseChipFilter } from "./exercise-chip-filter";
import { PRCard } from "./pr-card";
import { OneRmCards } from "./one-rm-cards";
import { WeightChart } from "./weight-chart";
import { VolumeChart } from "./volume-chart";
import { calculatePR } from "@/lib/calculations";
import type { Workout } from "@/types/database";

export function ProgressDashboard({ workouts }: { workouts: Workout[] }) {
  const exerciseNames = useMemo(() => {
    const set = new Set<string>();
    workouts.forEach((w) => w.exercises.forEach((e) => set.add(e.name)));
    return [...set].sort();
  }, [workouts]);

  const [selectedExercise, setSelectedExercise] = useState<string>(
    exerciseNames[0] ?? "",
  );

  if (!exerciseNames.length) {
    return <EmptyState message="Log some workouts to see progress." />;
  }

  const pr = calculatePR(workouts, selectedExercise);

  const chartData = workouts
    .filter((w) => w.exercises.some((e) => e.name === selectedExercise))
    .map((w) => {
      const exercise = w.exercises.find((e) => e.name === selectedExercise)!;
      const maxWeight = Math.max(...exercise.sets.map((s) => s.weight));
      const volume = exercise.sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
      const bestE1rm = Math.max(
        ...exercise.sets.map((s) => Math.round(s.weight * (1 + s.reps / 30))),
      );
      return {
        date: new Date(w.date + "T12:00:00").toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        maxWeight,
        volume,
        e1rm: bestE1rm,
        unit: w.unit || "kg",
      };
    });

  const unit = chartData[0]?.unit ?? "kg";

  return (
    <div>
      <ExerciseChipFilter
        exercises={exerciseNames}
        selected={selectedExercise}
        onSelect={setSelectedExercise}
      />

      {pr.maxWeight > 0 && (
        <>
          <PRCard
            maxWeight={pr.maxWeight}
            date={pr.maxWeightDate}
            unit={unit}
          />
          <OneRmCards
            e1rm={pr.maxE1rm}
            bestVolume={pr.maxVolume}
            unit={unit}
          />
        </>
      )}

      <WeightChart data={chartData} unit={unit} />
      <VolumeChart data={chartData} />
    </div>
  );
}
