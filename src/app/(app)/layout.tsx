import { TopBar } from "@/components/top-bar";
import { BottomNav } from "@/components/bottom-nav";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: routines } = await supabase
    .from("routines")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-dvh pb-20">
      <TopBar />
      <main className="p-5">{children}</main>
      <BottomNav routines={routines ?? []} />
    </div>
  );
}
