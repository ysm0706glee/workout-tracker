"use client";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load dashboard: {error.message}
        </AlertDescription>
      </Alert>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
