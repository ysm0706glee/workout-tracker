import { createClient } from "@/lib/supabase/server";
import { calculateStreak, calculateWeekCount } from "@/lib/calculations";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileForm } from "./_components/profile-form";
import { NotificationSettings } from "./_components/notification-settings";
import { LogOutButton } from "@/components/logout-button";
import { getProfile } from "./actions";
import type { Workout } from "@/types/database";

export default async function ProfilePage() {
  const supabase = await createClient();

  const [
    { data: userData },
    { data: workouts },
    profile,
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("workouts")
      .select("*")
      .order("date", { ascending: false }),
    getProfile(),
  ]);

  const user = userData.user;
  const allWorkouts = (workouts ?? []) as Workout[];

  const totalWorkouts = allWorkouts.length;
  const thisWeek = calculateWeekCount(allWorkouts);
  const streak = calculateStreak(allWorkouts);
  const firstWorkout = allWorkouts.length > 0 ? allWorkouts[allWorkouts.length - 1].date : null;

  const stats = [
    { value: totalWorkouts, label: "Total Workouts" },
    { value: thisWeek, label: "This Week" },
    { value: streak, label: "Day Streak" },
  ];

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold">Profile</h2>

      {/* Stats */}
      <div className="mb-4 grid grid-cols-3 gap-2.5">
        {stats.map((stat) => (
          <Card key={stat.label} className="py-4 text-center">
            <CardContent className="p-0 px-3.5">
              <div className="text-[26px] font-bold text-[#a29bfe]">
                {stat.value}
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Member since */}
      {(firstWorkout || user?.created_at) && (
        <p className="mb-4 text-center text-xs text-muted-foreground">
          Member since{" "}
          {new Date(user?.created_at ?? firstWorkout!).toLocaleDateString(
            undefined,
            { month: "long", year: "numeric" },
          )}
        </p>
      )}

      {/* Profile Form */}
      <ProfileForm
        profile={profile}
        email={user?.email ?? ""}
      />

      {/* Notification Settings */}
      <div className="mt-4">
        <NotificationSettings profile={profile} />
      </div>

      {/* Log out */}
      <div className="mt-6 flex justify-center">
        <LogOutButton />
      </div>
    </div>
  );
}
