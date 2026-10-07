import { getRoutines } from "@/lib/supabase/queries";
import { RoutineList } from "./_components/routine-list";

export default async function RoutinesPage() {
  const routines = await getRoutines();

  return <RoutineList routines={routines} />;
}
