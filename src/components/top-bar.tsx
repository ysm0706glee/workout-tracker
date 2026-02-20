import Link from "next/link";
import { LogOutButton } from "@/components/logout-button";

export function TopBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-[rgba(10,10,15,0.85)] px-5 pb-3 pt-4 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-[22px] font-bold tracking-tight">
          Iron<span className="text-[#a29bfe]">Log</span>
        </Link>
        <LogOutButton />
      </div>
    </header>
  );
}
