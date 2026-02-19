"use client";

import { Input } from "@/components/ui/input";

interface SetRowProps {
  index: number;
  weight: string;
  reps: string;
  onWeightChange: (value: string) => void;
  onRepsChange: (value: string) => void;
  onRemove: () => void;
}

export function SetRow({
  index,
  weight,
  reps,
  onWeightChange,
  onRepsChange,
  onRemove,
}: SetRowProps) {
  return (
    <div className="mb-2 grid grid-cols-[40px_1fr_1fr_40px] items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[13px] font-bold text-white">
        {index + 1}
      </div>
      <Input
        type="number"
        inputMode="decimal"
        placeholder="kg"
        value={weight}
        onChange={(e) => onWeightChange(e.target.value)}
        className="text-center"
      />
      <Input
        type="number"
        inputMode="numeric"
        placeholder="reps"
        value={reps}
        onChange={(e) => onRepsChange(e.target.value)}
        className="text-center"
      />
      <button
        onClick={onRemove}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-lg text-destructive"
      >
        &times;
      </button>
    </div>
  );
}
