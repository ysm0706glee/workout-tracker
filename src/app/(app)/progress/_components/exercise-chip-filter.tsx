"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
  const [search, setSearch] = useState("");

  const filtered = search
    ? exercises.filter((name) =>
        name.toLowerCase().includes(search.toLowerCase()),
      )
    : exercises;

  return (
    <Card className="mb-3.5">
      <CardHeader className="pb-3">
        <CardTitle className="text-[13px] uppercase tracking-wider text-muted-foreground">
          Select Exercise
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-[13px]"
          />
        </div>
        <div className="flex max-h-[160px] flex-wrap gap-2 overflow-y-auto">
          {filtered.map((name) => (
            <Badge
              key={name}
              variant={name === selected ? "default" : "outline"}
              className="cursor-pointer px-3.5 py-2 text-[13px] font-medium"
              onClick={() => onSelect(name)}
            >
              {name}
            </Badge>
          ))}
          {filtered.length === 0 && (
            <div className="text-[13px] text-muted-foreground">
              No exercises match &ldquo;{search}&rdquo;
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
