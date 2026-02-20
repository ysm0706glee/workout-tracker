import { NextRequest, NextResponse } from "next/server";
import { getAdminClient, sendPushToUser } from "@/lib/push-server";
import type { WorkoutExercise } from "@/types/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminClient();
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0 = Sunday, 1 = Monday

  const results: Record<string, number> = {
    missed_target: 0,
    weekly_summary: 0,
    routine_rotation: 0,
  };

  // --- 1. Missed Target Alert (runs daily) ---
  try {
    const { data: missedUsers } = await supabase
      .from("user_profiles")
      .select("user_id, target_days_per_week")
      .eq("notify_missed_target", true)
      .not("target_days_per_week", "is", null);

    if (missedUsers?.length) {
      // Get start of current week (Monday)
      const weekStart = new Date(now);
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      weekStart.setUTCDate(weekStart.getUTCDate() + mondayOffset);
      weekStart.setUTCHours(0, 0, 0, 0);
      const weekStartStr = weekStart.toISOString().split("T")[0];

      for (const user of missedUsers) {
        const { count } = await supabase
          .from("workouts")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.user_id)
          .gte("date", weekStartStr);

        const workoutsDone = count ?? 0;
        const target = user.target_days_per_week!;
        // Days elapsed this week (1 = Monday, 7 = Sunday)
        const daysElapsed = dayOfWeek === 0 ? 7 : dayOfWeek;
        const daysLeft = 7 - daysElapsed;
        const expectedPace = (target / 7) * daysElapsed;

        if (workoutsDone < expectedPace && daysLeft > 0) {
          await sendPushToUser(user.user_id, {
            title: "Behind pace this week",
            body: `${workoutsDone}/${target} workouts this week — ${daysLeft} day${daysLeft !== 1 ? "s" : ""} left!`,
            tag: "missed-target",
            url: "/log",
          });
          results.missed_target++;
        }
      }
    }
  } catch (e) {
    console.error("Missed target check failed:", e);
  }

  // --- 2. Weekly Summary (runs only on Sundays) ---
  if (dayOfWeek === 0) {
    try {
      const { data: summaryUsers } = await supabase
        .from("user_profiles")
        .select("user_id")
        .eq("notify_weekly_summary", true);

      if (summaryUsers?.length) {
        const weekStart = new Date(now);
        weekStart.setUTCDate(weekStart.getUTCDate() - 6); // Monday of this week
        weekStart.setUTCHours(0, 0, 0, 0);
        const weekStartStr = weekStart.toISOString().split("T")[0];

        for (const user of summaryUsers) {
          const { data: weekWorkouts } = await supabase
            .from("workouts")
            .select("*")
            .eq("user_id", user.user_id)
            .gte("date", weekStartStr);

          if (!weekWorkouts) continue;

          const workoutCount = weekWorkouts.length;
          if (workoutCount === 0) continue;

          // Calculate total volume
          let totalVolume = 0;
          const exerciseMaxWeights: Record<string, number> = {};

          for (const w of weekWorkouts) {
            const exercises = w.exercises as WorkoutExercise[];
            for (const ex of exercises) {
              for (const set of ex.sets) {
                totalVolume += set.weight * set.reps;
                if (
                  !exerciseMaxWeights[ex.name] ||
                  set.weight > exerciseMaxWeights[ex.name]
                ) {
                  exerciseMaxWeights[ex.name] = set.weight;
                }
              }
            }
          }

          // Check for PRs (compare week's max vs all-time before this week)
          let prCount = 0;
          const { data: olderWorkouts } = await supabase
            .from("workouts")
            .select("exercises")
            .eq("user_id", user.user_id)
            .lt("date", weekStartStr);

          if (olderWorkouts) {
            const allTimeMax: Record<string, number> = {};
            for (const w of olderWorkouts) {
              const exercises = w.exercises as WorkoutExercise[];
              for (const ex of exercises) {
                for (const set of ex.sets) {
                  if (!allTimeMax[ex.name] || set.weight > allTimeMax[ex.name]) {
                    allTimeMax[ex.name] = set.weight;
                  }
                }
              }
            }

            for (const [name, weekMax] of Object.entries(exerciseMaxWeights)) {
              if (!allTimeMax[name] || weekMax > allTimeMax[name]) {
                prCount++;
              }
            }
          }

          const volumeStr =
            totalVolume >= 1000
              ? `${(totalVolume / 1000).toFixed(1)}t`
              : `${totalVolume}kg`;

          const parts = [`${workoutCount} workout${workoutCount !== 1 ? "s" : ""}`];
          if (prCount > 0) parts.push(`${prCount} PR${prCount !== 1 ? "s" : ""}`);
          parts.push(`${volumeStr} volume`);

          await sendPushToUser(user.user_id, {
            title: "Your Week in Review",
            body: parts.join(" · "),
            tag: "weekly-summary",
            url: "/progress",
          });
          results.weekly_summary++;
        }
      }
    } catch (e) {
      console.error("Weekly summary failed:", e);
    }
  }

  // --- 3. Routine Rotation (runs only on Mondays) ---
  if (dayOfWeek === 1) {
    try {
      const { data: rotationUsers } = await supabase
        .from("user_profiles")
        .select("user_id, experience")
        .eq("notify_routine_rotation", true)
        .not("experience", "is", null);

      if (rotationUsers?.length) {
        const thresholds: Record<string, number> = {
          beginner: 10,
          intermediate: 5,
          advanced: 4,
        };

        for (const user of rotationUsers) {
          const weekThreshold = thresholds[user.experience!] ?? 6;

          const { data: routines } = await supabase
            .from("routines")
            .select("id, name")
            .eq("user_id", user.user_id);

          if (!routines?.length) continue;

          for (const routine of routines) {
            // Find the first workout using this routine
            const { data: firstWorkout } = await supabase
              .from("workouts")
              .select("date")
              .eq("user_id", user.user_id)
              .eq("routine_id", routine.id)
              .order("date", { ascending: true })
              .limit(1)
              .single();

            if (!firstWorkout) continue;

            const firstDate = new Date(firstWorkout.date);
            const weeksSince = Math.floor(
              (now.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000),
            );

            if (weeksSince >= weekThreshold) {
              await sendPushToUser(user.user_id, {
                title: "Time for a new routine?",
                body: `You've been on "${routine.name}" for ${weeksSince} weeks — consider switching it up!`,
                tag: `routine-rotation-${routine.id}`,
                url: "/routines",
              });
              results.routine_rotation++;
              break; // Only one rotation notification per user
            }
          }
        }
      }
    } catch (e) {
      console.error("Routine rotation check failed:", e);
    }
  }

  return NextResponse.json({ ok: true, sent: results });
}
