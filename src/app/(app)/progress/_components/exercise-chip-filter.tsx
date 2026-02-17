"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExerciseChipFilterProps {
  exercises: string[];
  selected: string;
  onSelect: (name: string) => void;
}

export function ExerciseChipFilter({
  exercises,
  selected,
  onSelect,
}: ExerciseChipFilterProps) {
  return (
    <Card className="mb-3.5">
      <CardHeader className="pb-3">
        <CardTitle className="text-[13px] uppercase tracking-wider text-muted-foreground">
          Select Exercise
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {exercises.map((name) => (
            <Badge
              key={name}
              variant={name === selected ? "default" : "outline"}
              className="cursor-pointer px-3.5 py-2 text-[13px] font-medium"
              onClick={() => onSelect(name)}
            >
              {name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
