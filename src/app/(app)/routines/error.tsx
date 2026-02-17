"use client";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function RoutinesError({
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
          Failed to load routines: {error.message}
        </AlertDescription>
      </Alert>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
