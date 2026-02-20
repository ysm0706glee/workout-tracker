"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { UserProfile } from "@/types/database";

export async function getProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (data as UserProfile) ?? null;
}

export async function updateProfile(fields: {
  display_name?: string;
  fitness_goal?: UserProfile["fitness_goal"];
  experience?: UserProfile["experience"];
  equipment?: UserProfile["equipment"];
}): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("user_profiles")
    .upsert(
      {
        user_id: user.id,
        ...fields,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

  if (error) throw new Error(error.message);
  revalidatePath("/profile");
}
