import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Routine } from "@/types/database";

// Shared by the app layout (bottom nav) and pages; React.cache makes it a
// single query per request.
export const getRoutines = cache(async (): Promise<Routine[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("routines")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as Routine[];
});
