"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  LayoutGrid,
  Plus,
  Clock,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { StartWorkoutDialog } from "@/app/(app)/dashboard/_components/start-workout-dialog";
import type { Routine } from "@/types/database";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/routines", label: "Routines", icon: LayoutGrid },
  { href: "#start", label: "Log", icon: Plus, isCenter: true },
  { href: "/history", label: "History", icon: Clock },
  { href: "/progress", label: "Progress", icon: Activity },
];

export function BottomNav({ routines }: { routines: Routine[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [startDialogOpen, setStartDialogOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-border bg-[rgba(20,20,32,0.92)] pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
        <div className="flex items-end">
        {navItems.map((item) => {
          const isActive = item.href !== "#start" && pathname.startsWith(item.href);

          if (item.isCenter) {
            return (
              <button
                key={item.href}
                onClick={() => setStartDialogOpen(true)}
                className="mx-auto -mt-[18px] flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-[0_4px_20px_rgba(108,92,231,0.5)]"
              >
                <Plus className="h-7 w-7" />
              </button>
            );
          }

          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-1.5 text-[10px] font-medium transition-colors",
                isActive ? "text-[#a29bfe]" : "text-muted-foreground",
              )}
            >
              <item.icon className="h-[22px] w-[22px]" />
              <span>{item.label}</span>
            </button>
          );
        })}
        </div>
      </nav>
      <StartWorkoutDialog
        routines={routines}
        open={startDialogOpen}
        onOpenChange={setStartDialogOpen}
      />
    </>
  );
}
