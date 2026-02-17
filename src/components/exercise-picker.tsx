"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { DEFAULT_EXERCISES } from "@/lib/constants/exercises";

interface ExercisePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (name: string) => void;
  title?: string;
  filterGroup?: string | null;
}

export function ExercisePicker({
  open,
  onOpenChange,
  onSelect,
  title = "Choose Exercise",
  filterGroup,
}: ExercisePickerProps) {
  const [search, setSearch] = useState("");

  function handleSelect(name: string) {
    onSelect(name);
    onOpenChange(false);
    setSearch("");
  }

  const filter = search.toLowerCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-[500px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3"
        />
        <div>
          {Object.entries(DEFAULT_EXERCISES).map(([group, exercises]) => {
            if (filterGroup && group !== filterGroup) return null;
            const filtered = exercises.filter((e) =>
              e.toLowerCase().includes(filter),
            );
            if (!filtered.length) return null;
            return (
              <div key={group}>
                <div className="mb-2 mt-4 border-b border-border pb-2 text-sm font-bold uppercase tracking-wider text-[#a29bfe] first:mt-0">
                  {group}
                </div>
                {filtered.map((name) => (
                  <button
                    key={name}
                    onClick={() => handleSelect(name)}
                    className="flex w-full items-center justify-between border-b border-border/50 py-3"
                  >
                    <span className="text-[15px]">{name}</span>
                    <Plus className="h-5 w-5 text-[#a29bfe]" />
                  </button>
                ))}
              </div>
            );
          })}
          {Object.entries(DEFAULT_EXERCISES).every(([group, exercises]) =>
            (filterGroup && group !== filterGroup) ||
            exercises.every((e) => !e.toLowerCase().includes(filter)),
          ) && (
            <div className="py-10 text-center text-muted-foreground">
              No exercises found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
