"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, BellOff, Loader2, Check } from "lucide-react";
import { subscribeToPush, unsubscribeFromPush, getPushPermission } from "@/lib/push";
import {
  updateProfile,
  savePushSubscription,
  removePushSubscription,
} from "../actions";
import type { UserProfile } from "@/types/database";

interface NotificationSettingsProps {
  profile: UserProfile | null;
}

const NOTIFICATION_TYPES = [
  {
    key: "notify_missed_target" as const,
    label: "Missed Target Alert",
    desc: "Get nudged when you're behind your weekly workout goal",
  },
  {
    key: "notify_weekly_summary" as const,
    label: "Weekly Summary",
    desc: "Sunday recap of your workouts, volume, and PRs",
  },
  {
    key: "notify_routine_rotation" as const,
    label: "Routine Rotation",
    desc: "Reminder to switch routines based on your experience level",
  },
];

export function NotificationSettings({ profile }: NotificationSettingsProps) {
  const [pushEnabled, setPushEnabled] = useState(false);
  const [permissionState, setPermissionState] = useState<
    NotificationPermission | "unsupported"
  >("default");
  const [targetDays, setTargetDays] = useState(
    profile?.target_days_per_week ?? 3,
  );
  const [notifications, setNotifications] = useState({
    notify_missed_target: profile?.notify_missed_target ?? false,
    notify_weekly_summary: profile?.notify_weekly_summary ?? false,
    notify_routine_rotation: profile?.notify_routine_rotation ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const permission = getPushPermission();
    setPermissionState(permission);
    if (permission === "granted") {
      // Check if there's an active subscription
      navigator.serviceWorker?.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) setPushEnabled(true);
        });
      });
    }
  }, []);

  async function handleEnablePush() {
    const subscription = await subscribeToPush();
    if (!subscription) {
      setPermissionState(getPushPermission());
      return;
    }

    await savePushSubscription({
      endpoint: subscription.endpoint!,
      keys: {
        p256dh: subscription.keys!.p256dh!,
        auth: subscription.keys!.auth!,
      },
    });

    setPushEnabled(true);
    setPermissionState("granted");
  }

  async function handleDisablePush() {
    const registration = await navigator.serviceWorker?.ready;
    const subscription = await registration?.pushManager.getSubscription();
    if (subscription) {
      await removePushSubscription(subscription.endpoint);
    }
    await unsubscribeFromPush();
    setPushEnabled(false);
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await updateProfile({
        target_days_per_week: targetDays,
        ...notifications,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  if (permissionState === "unsupported") return null;

  return (
    <div className="space-y-4">
      <Card className="py-4">
        <CardHeader className="px-4 py-0">
          <CardTitle className="text-sm">Push Notifications</CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-0">
          {permissionState === "denied" ? (
            <div className="rounded-[14px] border border-destructive/30 bg-destructive/10 p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                <BellOff className="h-4 w-4" />
                Notifications Blocked
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Enable notifications in your browser settings to use this
                feature.
              </p>
            </div>
          ) : !pushEnabled ? (
            <button
              onClick={handleEnablePush}
              className="flex w-full items-center gap-3 rounded-[14px] border border-border bg-card p-3 text-left transition-colors hover:border-muted-foreground/30"
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-semibold">
                  Enable Notifications
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  Get workout reminders and weekly summaries
                </div>
              </div>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-green-400">
                  <Bell className="h-4 w-4" />
                  Notifications Enabled
                </div>
                <button
                  onClick={handleDisablePush}
                  className="text-xs text-muted-foreground underline"
                >
                  Disable
                </button>
              </div>

              {/* Notification type toggles */}
              <div className="space-y-2">
                {NOTIFICATION_TYPES.map((type) => (
                  <button
                    key={type.key}
                    onClick={() =>
                      setNotifications((prev) => ({
                        ...prev,
                        [type.key]: !prev[type.key],
                      }))
                    }
                    disabled={saving}
                    className={`w-full rounded-[14px] border p-3 text-left transition-colors disabled:opacity-50 ${
                      notifications[type.key]
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-muted-foreground/30"
                    }`}
                  >
                    <div className="text-sm font-semibold">{type.label}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      {type.desc}
                    </div>
                  </button>
                ))}
              </div>

              {/* Target days per week (shown when missed target is enabled) */}
              {notifications.notify_missed_target && (
                <div className="rounded-[14px] border border-border bg-card p-3">
                  <div className="mb-2 text-sm font-semibold">
                    Weekly Target
                  </div>
                  <div className="flex items-center gap-3">
                    {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                      <button
                        key={n}
                        onClick={() => setTargetDays(n)}
                        disabled={saving}
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors disabled:opacity-50 ${
                          targetDays === n
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                    <span className="text-xs text-muted-foreground">
                      days/week
                    </span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Saved
                  </>
                ) : (
                  "Save Notification Settings"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
