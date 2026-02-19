"use server";

import Anthropic from "@anthropic-ai/sdk";
import {
  buildRoutineGenerationPrompt,
  type RoutineGenerationInput,
} from "@/lib/ai/prompts";
import type { RoutineExercise } from "@/types/database";

interface GeneratedRoutine {
  name: string;
  exercises: RoutineExercise[];
}

const client = new Anthropic();

export async function generateRoutines(
  input: RoutineGenerationInput,
): Promise<GeneratedRoutine[]> {
  const prompt = buildRoutineGenerationPrompt(input);

  const message = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  // Extract JSON from response (handle potential markdown code blocks)
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Failed to parse AI response");
  }

  const routines: GeneratedRoutine[] = JSON.parse(jsonMatch[0]);

  // Validate structure
  for (const routine of routines) {
    if (!routine.name || !Array.isArray(routine.exercises)) {
      throw new Error("Invalid routine structure from AI");
    }
    for (const exercise of routine.exercises) {
      if (!exercise.name || !exercise.defaultSets || !exercise.defaultReps) {
        throw new Error("Invalid exercise structure from AI");
      }
      exercise.defaultSets = Math.max(1, Math.min(10, Math.round(exercise.defaultSets)));
      exercise.defaultReps = Math.max(1, Math.min(30, Math.round(exercise.defaultReps)));
    }
  }

  return routines;
}
