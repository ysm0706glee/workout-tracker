"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteWorkout(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("workouts").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/history");
  revalidatePath("/dashboard");
  revalidatePath("/progress");
}
