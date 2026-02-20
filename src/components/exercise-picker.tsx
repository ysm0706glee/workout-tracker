"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { DEFAULT_EXERCISES } from "@/lib/constants/exercises";
import { addCustomExercise } from "@/app/(app)/exercises/actions";
import type { Exercise } from "@/types/database";

const MUSCLE_GROUPS = ["Chest", "Back", "Shoulders", "Arms", "Legs", "Core"];

interface ExercisePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (name: string) => void;
  title?: string;
  filterGroup?: string | null;
  customExercises?: Exercise[];
  onExerciseAdded?: (exercise: Exercise) => void;
}

export function ExercisePicker({
  open,
  onOpenChange,
  onSelect,
  title = "Choose Exercise",
  filterGroup,
  customExercises = [],
  onExerciseAdded,
}: ExercisePickerProps) {
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [addingGroup, setAddingGroup] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSelect(name: string) {
    onSelect(name);
    onOpenChange(false);
    setSearch("");
    setAdding(false);
    setNewName("");
    setAddingGroup(null);
  }

  function startAdding() {
    setAdding(true);
    setNewName(search.trim());
    setAddingGroup(null);
  }

  function cancelAdding() {
    setAdding(false);
    setNewName("");
    setAddingGroup(null);
  }

  function handleAdd() {
    const name = newName.trim();
    if (!name || !addingGroup) return;
    startTransition(async () => {
      const exercise = await addCustomExercise(name, addingGroup);
      onExerciseAdded?.(exercise);
      handleSelect(exercise.name);
    });
  }

  const filter = search.toLowerCase();

  // Merge custom exercises into default groups
  const customByGroup: Record<string, Exercise[]> = {};
  for (const ex of customExercises) {
    (customByGroup[ex.muscle_group] ??= []).push(ex);
  }

  // Build unified list per muscle group
  const allGroups = MUSCLE_GROUPS.map((group) => {
    if (filterGroup && group !== filterGroup) return null;

    const defaults = (DEFAULT_EXERCISES[group] ?? []).filter((e) =>
      e.name.toLowerCase().includes(filter),
    );
    const custom = (customByGroup[group] ?? []).filter((e) =>
      e.name.toLowerCase().includes(filter),
    );

    if (!defaults.length && !custom.length) return null;

    return { group, defaults, custom };
  }).filter(Boolean) as { group: string; defaults: { name: string; description: string }[]; custom: Exercise[] }[];

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

        {!adding ? (
          <>
            {allGroups.map(({ group, defaults, custom }) => (
              <div key={group}>
                <div className="mb-2 mt-4 border-b border-border pb-2 text-sm font-bold uppercase tracking-wider text-[#a29bfe] first:mt-0">
                  {group}
                </div>
                {custom.map((exercise) => (
                  <button
                    key={exercise.id}
                    onClick={() => handleSelect(exercise.name)}
                    className="flex w-full items-center justify-between border-b border-border/50 py-3"
                  >
                    <span className="text-[15px]">{exercise.name}</span>
                    <Plus className="ml-2 h-5 w-5 shrink-0 text-[#a29bfe]" />
                  </button>
                ))}
                {defaults.map((exercise) => (
                  <button
                    key={exercise.name}
                    onClick={() => handleSelect(exercise.name)}
                    className="flex w-full items-center justify-between border-b border-border/50 py-3"
                  >
                    <div className="text-left">
                      <span className="text-[15px]">{exercise.name}</span>
                      <p className="text-[12px] leading-snug text-muted-foreground">
                        {exercise.description}
                      </p>
                    </div>
                    <Plus className="ml-2 h-5 w-5 shrink-0 text-[#a29bfe]" />
                  </button>
                ))}
              </div>
            ))}

            {allGroups.length === 0 && filter.length > 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No exercises found
              </div>
            )}

            {/* Always show add button at the bottom */}
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={startAdding}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Exercise
            </Button>
          </>
        ) : (
          <div className="py-4">
            <div className="space-y-3">
              <div>
                <p className="mb-1.5 text-xs text-muted-foreground">Exercise name</p>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Cable Flyes"
                  autoFocus
                />
              </div>
              <div>
                <p className="mb-2 text-xs text-muted-foreground">Muscle group</p>
                <div className="flex flex-wrap gap-2">
                  {MUSCLE_GROUPS.map((g) => (
                    <Badge
                      key={g}
                      variant={addingGroup === g ? "default" : "outline"}
                      className="cursor-pointer px-3 py-1.5 text-[12px]"
                      onClick={() => setAddingGroup(g)}
                    >
                      {g}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={cancelAdding}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  disabled={!newName.trim() || !addingGroup || isPending}
                  onClick={handleAdd}
                >
                  {isPending ? "Adding..." : "Add Exercise"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
