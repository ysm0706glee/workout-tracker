"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Routine } from "@/types/database";

interface StartWorkoutDialogProps {
  routines: Routine[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: boolean;
}

export function StartWorkoutDialog({
  routines,
  open,
  onOpenChange,
  trigger = true,
}: StartWorkoutDialogProps) {
  const router = useRouter();

  function startEmpty() {
    onOpenChange?.(false);
    router.push("/log");
  }

  function startFromRoutine(routineId: string) {
    onOpenChange?.(false);
    router.push(`/log?routineId=${routineId}`);
  }

  const dialogContent = (
    <DialogContent className="max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Start Workout</DialogTitle>
      </DialogHeader>
      <div className="space-y-2.5">
        <button
          onClick={startEmpty}
          className="w-full rounded-[14px] border border-border bg-secondary p-4 text-left transition-colors hover:border-primary hover:bg-primary/[0.08]"
        >
          <div className="text-[16px] font-semibold">Empty Workout</div>
          <div className="text-[13px] text-muted-foreground">
            Build your workout from scratch
          </div>
        </button>

        {routines.length === 0 ? (
          <div className="py-4 text-center text-[13px] text-muted-foreground">
            No routines yet.{" "}
            <button
              onClick={() => {
                onOpenChange?.(false);
                router.push("/routines");
              }}
              className="text-[#a29bfe] hover:underline"
            >
              Create one
            </button>
          </div>
        ) : (
          routines.map((r) => {
            const exNames =
              r.exercises
                .map((e) => e.name)
                .slice(0, 4)
                .join(", ") + (r.exercises.length > 4 ? " ..." : "");
            return (
              <button
                key={r.id}
                onClick={() => startFromRoutine(r.id)}
                className="w-full rounded-[14px] border border-border bg-secondary p-4 text-left transition-colors hover:border-primary hover:bg-primary/[0.08]"
              >
                <div className="text-[16px] font-semibold">{r.name}</div>
                <div className="text-[13px] text-muted-foreground">
                  {exNames}
                </div>
              </button>
            );
          })
        )}
      </div>
    </DialogContent>
  );

  if (open !== undefined) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog>
      {trigger && (
        <DialogTrigger asChild>
          <Button className="mb-3.5 w-full">
            <Plus className="mr-2 h-5 w-5" />
            Start Workout
          </Button>
        </DialogTrigger>
      )}
      {dialogContent}
    </Dialog>
  );
}
