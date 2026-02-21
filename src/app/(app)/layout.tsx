import { redirect } from "next/navigation";
import { TopBar } from "@/components/top-bar";
import { BottomNav } from "@/components/bottom-nav";
import { OfflineBanner } from "@/components/offline-banner";
import { QueueSync } from "@/components/queue-sync";
import { Toaster } from "@/components/ui/sonner";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: routines } = await supabase
    .from("routines")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto min-h-dvh max-w-md pb-20">
      <OfflineBanner />
      <QueueSync />
      <TopBar />
      <main className="p-5">{children}</main>
      <BottomNav routines={routines ?? []} />
      <Toaster />
    </div>
  );
}
