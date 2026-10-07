"use server";

import { createClient, getUserId } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { UserProfile } from "@/types/database";

export async function getProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const userId = await getUserId();
  if (!userId) return null;

  const { data } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  return (data as UserProfile) ?? null;
}

export async function updateProfile(fields: {
  display_name?: string;
  experience?: UserProfile["experience"];
  target_days_per_week?: number | null;
  notify_missed_target?: boolean;
  notify_weekly_summary?: boolean;
  notify_routine_rotation?: boolean;
}): Promise<void> {
  const supabase = await createClient();
  const userId = await getUserId();
  if (!userId) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("user_profiles")
    .upsert(
      {
        user_id: userId,
        ...fields,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

  if (error) throw new Error(error.message);
  revalidatePath("/profile");
}

export async function savePushSubscription(subscription: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}): Promise<void> {
  const supabase = await createClient();
  const userId = await getUserId();
  if (!userId) throw new Error("Not authenticated");

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    { onConflict: "user_id,endpoint" },
  );

  if (error) throw new Error(error.message);
}

export async function removePushSubscription(
  endpoint: string,
): Promise<void> {
  const supabase = await createClient();
  const userId = await getUserId();
  if (!userId) throw new Error("Not authenticated");

  await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", userId)
    .eq("endpoint", endpoint);
}
