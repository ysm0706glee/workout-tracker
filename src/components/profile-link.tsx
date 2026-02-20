import Link from "next/link";
import { User } from "lucide-react";

export function ProfileLink() {
  return (
    <Link
      href="/profile"
      className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      aria-label="Profile"
    >
      <User className="h-4 w-4" />
    </Link>
  );
}
