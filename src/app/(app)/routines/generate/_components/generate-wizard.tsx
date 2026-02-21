"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { createRoutine } from "../../actions";
import { generateRoutines } from "../actions";
import type { RoutineExercise, UserProfile } from "@/types/database";
import { ArrowLeft, ArrowRight, Sparkles, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";

interface GeneratedRoutine {
  name: string;
  exercises: RoutineExercise[];
}

const GOALS = [
  { value: "strength", label: "Strength", desc: "Lift heavier, get stronger" },
  { value: "hypertrophy", label: "Muscle Growth", desc: "Build size and definition" },
  { value: "general", label: "General Fitness", desc: "Overall health and balance" },
];

const EXPERIENCE = [
  { value: "beginner", label: "Beginner", desc: "New to working out (0-6 months)" },
  { value: "intermediate", label: "Intermediate", desc: "Consistent training (6mo-2yr)" },
  { value: "advanced", label: "Advanced", desc: "Experienced lifter (2+ years)" },
];

const EQUIPMENT = [
  { value: "barbell", label: "Barbell", desc: "Squats, bench press, deadlifts" },
  { value: "dumbbells", label: "Dumbbells", desc: "DB press, curls, rows" },
  { value: "machines", label: "Machines", desc: "Leg press, lat pulldown" },
  { value: "cables", label: "Cables", desc: "Cable rows, tricep pushdowns" },
  { value: "bodyweight", label: "Bodyweight", desc: "Pull-ups, dips, push-ups" },
];

const MUSCLE_GROUPS = ["Chest", "Back", "Shoulders", "Arms", "Legs", "Core"];

type StepId = "goal" | "experience" | "frequency" | "equipment" | "focus";

const ALL_STEPS: { id: StepId; label: string }[] = [
  { id: "goal", label: "Goal" },
  { id: "experience", label: "Experience" },
  { id: "frequency", label: "Frequency" },
  { id: "equipment", label: "Equipment" },
  { id: "focus", label: "Focus" },
];

export function GenerateWizard({ profile }: { profile?: UserProfile | null }) {
  const router = useRouter();

  // Skip steps that are already filled in the user's profile
  const activeSteps = ALL_STEPS.filter((s) => {
    if (s.id === "goal" && profile?.fitness_goal) return false;
    if (s.id === "experience" && profile?.experience) return false;
    if (s.id === "equipment" && profile?.equipment && profile.equipment.length > 0) return false;
    return true;
  });
  const skippedCount = ALL_STEPS.length - activeSteps.length;

  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState(profile?.fitness_goal ?? "");
  const [experience, setExperience] = useState(profile?.experience ?? "");
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [sessionMinutes, setSessionMinutes] = useState(60);
  const [equipment, setEquipment] = useState<string[]>(profile?.equipment ?? []);
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [stepError, setStepError] = useState("");
  const [results, setResults] = useState<GeneratedRoutine[] | null>(null);
  const [saving, setSaving] = useState(false);

  const currentStepId = activeSteps[step]?.id;

  function canAdvance() {
    if (currentStepId === "goal") return !!goal;
    if (currentStepId === "experience") return !!experience;
    if (currentStepId === "frequency") return true;
    if (currentStepId === "equipment") return equipment.length > 0;
    if (currentStepId === "focus") return true;
    return true;
  }

  function toggleFocus(group: string) {
    setFocusAreas((prev) =>
      prev.includes(group)
        ? prev.filter((g) => g !== group)
        : [...prev, group],
    );
  }

  async function handleGenerate() {
    setGenerating(true);
    setError("");
    try {
      const routines = await generateRoutines({
        goal,
        experience,
        daysPerWeek,
        sessionMinutes,
        equipment: equipment.join(", "),
        focusAreas,
      });
      setResults(routines);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate routines");
    } finally {
      setGenerating(false);
    }
  }

  function updateRoutineName(index: number, name: string) {
    if (!results) return;
    setResults(results.map((r, i) => (i === index ? { ...r, name } : r)));
  }

  function updateExercise(
    routineIndex: number,
    exerciseIndex: number,
    field: "defaultSets" | "defaultReps",
    value: number,
  ) {
    if (!results) return;
    setResults(
      results.map((r, ri) =>
        ri === routineIndex
          ? {
              ...r,
              exercises: r.exercises.map((e, ei) =>
                ei === exerciseIndex ? { ...e, [field]: value || 1 } : e,
              ),
            }
          : r,
      ),
    );
  }

  function removeExercise(routineIndex: number, exerciseIndex: number) {
    if (!results) return;
    setResults(
      results.map((r, ri) =>
        ri === routineIndex
          ? { ...r, exercises: r.exercises.filter((_, ei) => ei !== exerciseIndex) }
          : r,
      ),
    );
  }

  async function handleSaveAll() {
    if (!results) return;
    setSaving(true);
    try {
      for (const routine of results) {
        if (routine.exercises.length > 0) {
          await createRoutine(routine.name, routine.exercises);
        }
      }
      toast.success("Routines saved!");
      router.push("/routines");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save routines");
    } finally {
      setSaving(false);
    }
  }

  // Preview/results screen
  if (results) {
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Your AI Program</h2>
          <Badge variant="secondary">{results.length} routines</Badge>
        </div>

        <p className="mb-4 text-sm text-muted-foreground">
          Review and edit your routines before saving.
        </p>

        <div className="space-y-4">
          {results.map((routine, ri) => (
            <div
              key={ri}
              className="rounded-[14px] border border-border bg-card p-4"
            >
              <Input
                value={routine.name}
                onChange={(e) => updateRoutineName(ri, e.target.value)}
                className="mb-3 text-base font-bold"
              />
              <div className="space-y-2">
                {routine.exercises.map((exercise, ei) => (
                  <div
                    key={ei}
                    className="flex items-center gap-2 rounded-lg bg-secondary p-2.5"
                  >
                    <div className="flex-1">
                      <span className="text-sm font-medium">{exercise.name}</span>
                      {exercise.description && (
                        <p className="text-[11px] leading-snug text-muted-foreground">
                          {exercise.description}
                        </p>
                      )}
                    </div>
                    <Input
                      type="number"
                      className="w-[52px] text-center text-sm"
                      value={exercise.defaultSets}
                      onChange={(e) =>
                        updateExercise(ri, ei, "defaultSets", parseInt(e.target.value))
                      }
                      min={1}
                    />
                    <span className="text-xs text-muted-foreground">&times;</span>
                    <Input
                      type="number"
                      className="w-[52px] text-center text-sm"
                      value={exercise.defaultReps}
                      onChange={(e) =>
                        updateExercise(ri, ei, "defaultReps", parseInt(e.target.value))
                      }
                      min={1}
                    />
                    <button
                      onClick={() => removeExercise(ri, ei)}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-3 rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setResults(null);
              setStep(0);
            }}
          >
            Start Over
          </Button>
          <Button className="flex-1" onClick={handleSaveAll} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Save All Routines
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {skippedCount > 0 && (
        <p className="mb-4 text-xs text-muted-foreground">
          Using goal, experience, and equipment from your profile.
        </p>
      )}

      {/* Step indicator */}
      <div className="mb-6 flex items-center gap-1">
        {activeSteps.map((s, i) => (
          <div key={s.id} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={`h-1.5 w-full rounded-full ${
                i <= step ? "bg-primary" : "bg-secondary"
              }`}
            />
            <span
              className={`text-[10px] ${
                i === step ? "text-primary font-medium" : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Step: Goal */}
      {currentStepId === "goal" && (
        <div>
          <h2 className="mb-1 text-lg font-bold">What&apos;s your goal?</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            This determines rep ranges and exercise selection.
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {GOALS.map((g) => (
              <button
                key={g.value}
                onClick={() => setGoal(g.value)}
                className={`rounded-[14px] border p-4 text-left transition-colors ${
                  goal === g.value
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-muted-foreground/30"
                }`}
              >
                <div className="text-sm font-semibold">{g.label}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{g.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step: Experience */}
      {currentStepId === "experience" && (
        <div>
          <h2 className="mb-1 text-lg font-bold">Experience level?</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Helps determine volume and exercise complexity.
          </p>
          <div className="space-y-2.5">
            {EXPERIENCE.map((e) => (
              <button
                key={e.value}
                onClick={() => setExperience(e.value)}
                className={`w-full rounded-[14px] border p-4 text-left transition-colors ${
                  experience === e.value
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-muted-foreground/30"
                }`}
              >
                <div className="text-sm font-semibold">{e.label}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{e.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step: Frequency & Duration */}
      {currentStepId === "frequency" && (
        <div>
          <h2 className="mb-1 text-lg font-bold">How often & how long?</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            We&apos;ll create one routine per training day.
          </p>

          <div className="mb-5">
            <div className="mb-2 text-sm font-medium">
              Days per week: <span className="text-primary">{daysPerWeek}</span>
            </div>
            <div className="flex gap-2">
              {[2, 3, 4, 5, 6].map((d) => (
                <button
                  key={d}
                  onClick={() => setDaysPerWeek(d)}
                  className={`flex-1 rounded-lg border py-2.5 text-sm font-semibold transition-colors ${
                    daysPerWeek === d
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card hover:border-muted-foreground/30"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm font-medium">
              Session length: <span className="text-primary">{sessionMinutes} min</span>
            </div>
            <div className="flex gap-2">
              {[30, 45, 60, 90].map((m) => (
                <button
                  key={m}
                  onClick={() => setSessionMinutes(m)}
                  className={`flex-1 rounded-lg border py-2.5 text-sm font-semibold transition-colors ${
                    sessionMinutes === m
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card hover:border-muted-foreground/30"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step: Equipment */}
      {currentStepId === "equipment" && (
        <div>
          <h2 className="mb-1 text-lg font-bold">Available equipment?</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Select all that apply.
          </p>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT.map((e) => (
              <button
                key={e.value}
                onClick={() => {
                  setEquipment((prev) =>
                    prev.includes(e.value)
                      ? prev.filter((v) => v !== e.value)
                      : [...prev, e.value],
                  );
                  setStepError("");
                }}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  equipment.includes(e.value)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card hover:border-muted-foreground/30"
                }`}
              >
                {e.label}
              </button>
            ))}
          </div>
          {stepError && (
            <p className="mt-3 text-sm text-destructive">{stepError}</p>
          )}
        </div>
      )}

      {/* Step: Focus Areas */}
      {currentStepId === "focus" && (
        <div>
          <h2 className="mb-1 text-lg font-bold">Any focus areas?</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Optional. Select muscle groups to emphasize.
          </p>
          <div className="flex flex-wrap gap-2">
            {MUSCLE_GROUPS.map((group) => (
              <button
                key={group}
                onClick={() => toggleFocus(group)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  focusAreas.includes(group)
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border bg-card hover:border-muted-foreground/30"
                }`}
              >
                {group}
              </button>
            ))}
          </div>
          {focusAreas.length === 0 && (
            <p className="mt-3 text-xs text-muted-foreground">
              Skip this for a balanced program.
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="mt-6 flex gap-2">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep(step - 1)}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        )}
        <div className="flex-1" />
        {step < activeSteps.length - 1 ? (
          <Button
            onClick={() => {
              if (!canAdvance()) {
                if (currentStepId === "equipment") {
                  setStepError("Select at least one piece of equipment to continue.");
                }
                return;
              }
              setStepError("");
              setStep(step + 1);
            }}
          >
            Next
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleGenerate} disabled={generating || !canAdvance()}>
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Program
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
