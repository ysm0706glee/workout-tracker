import { Suspense } from "react";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/top-bar";
import { BottomNav } from "@/components/bottom-nav";
import { OfflineBanner } from "@/components/offline-banner";
import { QueueSync } from "@/components/queue-sync";
import { Toaster } from "@/components/ui/sonner";
import { getUserId } from "@/lib/supabase/server";
import { getRoutines } from "@/lib/supabase/queries";

async function BottomNavWithRoutines() {
  const routines = await getRoutines();
  return <BottomNav routines={routines} />;
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await getUserId())) {
    redirect("/login");
  }

  return (
    <div className="mx-auto min-h-dvh max-w-md pb-20">
      <OfflineBanner />
      <QueueSync />
      <TopBar />
      <main className="p-5">{children}</main>
      {/* Routines stream in so the shell isn't blocked on the query */}
      <Suspense fallback={<BottomNav routines={null} />}>
        <BottomNavWithRoutines />
      </Suspense>
      <Toaster />
    </div>
  );
}
