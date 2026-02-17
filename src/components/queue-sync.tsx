"use client";

import { useEffect } from "react";
import { syncPendingWorkouts } from "@/lib/sync-workouts";
import { getQueueCount } from "@/lib/offline-queue";

export function QueueSync() {
  useEffect(() => {
    // Sync on mount if online and queue has items
    if (navigator.onLine && getQueueCount() > 0) {
      syncPendingWorkouts();
    }

    // Also sync when coming back online
    const handleOnline = () => {
      if (getQueueCount() > 0) {
        syncPendingWorkouts();
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  return null;
}
