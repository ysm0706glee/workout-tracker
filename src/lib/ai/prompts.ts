import { DEFAULT_EXERCISES } from "@/lib/constants/exercises";

export interface RoutineGenerationInput {
  goal: string;
  experience: string;
  daysPerWeek: number;
  sessionMinutes: number;
  equipment: string;
  focusAreas: string[];
}

function exerciseListString(): string {
  return Object.entries(DEFAULT_EXERCISES)
    .map(([group, exercises]) => `${group}: ${exercises.join(", ")}`)
    .join("\n");
}

export function buildRoutineGenerationPrompt(input: RoutineGenerationInput): string {
  return `You are a certified personal trainer creating a workout program.

Generate a complete weekly program of ${input.daysPerWeek} workout routines based on:
- Goal: ${input.goal}
- Experience level: ${input.experience}
- Session duration: ${input.sessionMinutes} minutes
- Equipment: ${input.equipment}
${input.focusAreas.length > 0 ? `- Focus areas: ${input.focusAreas.join(", ")}` : ""}

Here are some common exercises organized by muscle group (you may also suggest other exercises that fit the user's equipment):
${exerciseListString()}

Rules:
- Each routine should have 4-8 exercises
- Sets should be between 2-5, reps between 3-20 depending on the goal
- For strength: lower reps (3-6), more sets (4-5)
- For hypertrophy: moderate reps (8-12), moderate sets (3-4)
- For endurance: higher reps (12-20), fewer sets (2-3)
- Give each routine a clear, descriptive name (e.g. "Push Day", "Upper Body A", "Full Body 1")
- Balance muscle groups across the week
- Consider recovery between sessions

Respond with ONLY valid JSON in this exact format, no other text:
[
  {
    "name": "Routine Name",
    "exercises": [
      { "name": "Exercise Name", "defaultSets": 4, "defaultReps": 8 }
    ]
  }
]`;
}

