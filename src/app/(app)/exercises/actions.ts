"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Exercise } from "@/types/database";

export async function addCustomExercise(
  name: string,
  muscleGroup: string,
): Promise<Exercise> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("exercises")
    .insert({ user_id: user.id, name, muscle_group: muscleGroup })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/log");
  revalidatePath("/routines");
  return data as Exercise;
}

export async function getUserExercises(): Promise<Exercise[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Exercise[];
}
