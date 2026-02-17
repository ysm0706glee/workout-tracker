"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { RoutineExercise } from "@/types/database";

export async function createRoutine(name: string, exercises: RoutineExercise[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("routines").insert({
    user_id: user.id,
    name,
    exercises,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/routines");
  revalidatePath("/dashboard");
}

export async function updateRoutine(
  id: string,
  name: string,
  exercises: RoutineExercise[],
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("routines")
    .update({ name, exercises, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/routines");
  revalidatePath("/dashboard");
}

export async function deleteRoutine(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("routines").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/routines");
  revalidatePath("/dashboard");
}
