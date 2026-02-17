import { createClient } from "@/lib/supabase/server";
import { RoutineList } from "./_components/routine-list";
import type { Routine } from "@/types/database";

export default async function RoutinesPage() {
  const supabase = await createClient();
  const { data: routines } = await supabase
    .from("routines")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <RoutineList routines={(routines ?? []) as Routine[]} />
  );
}
