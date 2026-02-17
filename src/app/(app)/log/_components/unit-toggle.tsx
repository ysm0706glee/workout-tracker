"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface UnitToggleProps {
  unit: "kg" | "lb";
  onUnitChange: (unit: "kg" | "lb") => void;
}

export function UnitToggle({ unit, onUnitChange }: UnitToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={unit}
      onValueChange={(v) => {
        if (v) onUnitChange(v as "kg" | "lb");
      }}
      className="mb-4 w-full"
    >
      <ToggleGroupItem value="kg" className="flex-1">
        Kilograms (kg)
      </ToggleGroupItem>
      <ToggleGroupItem value="lb" className="flex-1">
        Pounds (lb)
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
