"use server";

import Anthropic from "@anthropic-ai/sdk";
import {
  buildRoutineGenerationPrompt,
  type RoutineGenerationInput,
} from "@/lib/ai/prompts";
import type { RoutineExercise } from "@/types/database";
import { createClient } from "@/lib/supabase/server";

const AI_GENERATION_LIMIT = 3;

interface GeneratedRoutine {
  name: string;
  exercises: RoutineExercise[];
}

function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function getAiUsage(): Promise<{ used: number; limit: number }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { used: 0, limit: AI_GENERATION_LIMIT };

  const period = getCurrentPeriod();
  const { data } = await supabase
    .from("ai_usage")
    .select("generation_count")
    .eq("user_id", user.id)
    .eq("period", period)
    .single();

  return { used: data?.generation_count ?? 0, limit: AI_GENERATION_LIMIT };
}

export async function generateRoutines(
  input: RoutineGenerationInput,
): Promise<GeneratedRoutine[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const period = getCurrentPeriod();

  // Check current usage
  const { data: usageRow } = await supabase
    .from("ai_usage")
    .select("generation_count")
    .eq("user_id", user.id)
    .eq("period", period)
    .single();

  const currentCount = usageRow?.generation_count ?? 0;
  if (currentCount >= AI_GENERATION_LIMIT) {
    throw new Error(
      `You've reached the limit of ${AI_GENERATION_LIMIT} AI generations for this month. Resets on the 1st.`,
    );
  }

  const client = new Anthropic();
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

  // Increment usage count (upsert)
  await supabase.from("ai_usage").upsert(
    {
      user_id: user.id,
      period,
      generation_count: currentCount + 1,
    },
    { onConflict: "user_id,period" },
  );

  return routines;
}
