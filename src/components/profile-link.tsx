"use client";

import { useRouter } from "next/navigation";
import { User } from "lucide-react";

export function ProfileLink() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/profile")}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      aria-label="Profile"
    >
      <User className="h-4 w-4" />
    </button>
  );
}
