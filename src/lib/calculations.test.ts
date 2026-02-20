import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  calculate1RM,
  calculateStreak,
  calculateWeekCount,
  calculatePR,
  calculateOverloadSuggestion,
} from "./calculations";
import type { Workout } from "@/types/database";

function makeWorkout(
  overrides: Partial<Workout> & { date: string },
): Workout {
  return {
    id: "test-id",
    user_id: "user-1",
    unit: "kg",
    exercises: [],
    notes: null,
    created_at: overrides.date,
    routine_id: null,
    local_id: null,
    ...overrides,
  };
}

describe("calculate1RM", () => {
  it("returns the weight itself for 1 rep", () => {
    // Epley: weight * (1 + 1/30) ≈ weight * 1.033
    expect(calculate1RM(100, 1)).toBe(103);
  });

  it("calculates correctly for multiple reps", () => {
    // 100 * (1 + 10/30) = 100 * 1.333 = 133
    expect(calculate1RM(100, 10)).toBe(133);
  });

  it("returns the weight for 0 reps", () => {
    expect(calculate1RM(100, 0)).toBe(100);
  });
});

describe("calculateStreak", () => {
  // Helper: compute the local date string the same way calculateStreak does
  // (toISOString converts to UTC, so we need matching dates)
  function localDateStr(d: Date): string {
    const copy = new Date(d);
    copy.setHours(0, 0, 0, 0);
    return copy.toISOString().split("T")[0];
  }

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-20T12:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 0 for empty workouts", () => {
    expect(calculateStreak([])).toBe(0);
  });

  it("returns 1 if only today has a workout", () => {
    const today = new Date();
    const todayStr = localDateStr(today);
    const workouts = [makeWorkout({ date: todayStr })];
    expect(calculateStreak(workouts)).toBe(1);
  });

  it("returns 1 if only yesterday has a workout", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = localDateStr(yesterday);
    const workouts = [makeWorkout({ date: yesterdayStr })];
    expect(calculateStreak(workouts)).toBe(1);
  });

  it("returns 0 if last workout was 2 days ago", () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const twoDaysAgoStr = localDateStr(twoDaysAgo);
    const workouts = [makeWorkout({ date: twoDaysAgoStr })];
    expect(calculateStreak(workouts)).toBe(0);
  });

  it("counts consecutive days", () => {
    const today = new Date();
    const dates = [0, -1, -2].map((offset) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offset);
      return localDateStr(d);
    });
    const workouts = dates.map((date) => makeWorkout({ date }));
    expect(calculateStreak(workouts)).toBe(3);
  });

  it("stops counting at a gap", () => {
    const today = new Date();
    // today, yesterday, skip a day, 3 days ago
    const offsets = [0, -1, -3];
    const workouts = offsets.map((offset) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offset);
      return makeWorkout({ date: localDateStr(d) });
    });
    expect(calculateStreak(workouts)).toBe(2);
  });
});

describe("calculateWeekCount", () => {
  beforeEach(() => {
    // Wednesday Feb 20, 2026 — week started Sunday Feb 15
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-20T12:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 0 for empty workouts", () => {
    expect(calculateWeekCount([])).toBe(0);
  });

  it("counts workouts from this week", () => {
    const workouts = [
      makeWorkout({ date: "2026-02-20" }), // Wed - this week
      makeWorkout({ date: "2026-02-16" }), // Mon - this week
      makeWorkout({ date: "2026-02-14" }), // Sat - last week
    ];
    expect(calculateWeekCount(workouts)).toBe(2);
  });
});

describe("calculatePR", () => {
  it("returns zeros when exercise not found", () => {
    const result = calculatePR([], "Bench Press");
    expect(result).toEqual({
      maxWeight: 0,
      maxWeightDate: "",
      maxE1rm: 0,
      maxVolume: 0,
    });
  });

  it("finds max weight, e1rm, and volume", () => {
    const workouts: Workout[] = [
      makeWorkout({
        date: "2026-02-20",
        exercises: [
          {
            name: "Bench Press",
            sets: [
              { weight: 100, reps: 5 },
              { weight: 80, reps: 10 },
            ],
          },
        ],
      }),
      makeWorkout({
        date: "2026-02-18",
        exercises: [
          {
            name: "Bench Press",
            sets: [{ weight: 90, reps: 8 }],
          },
        ],
      }),
    ];

    const result = calculatePR(workouts, "Bench Press");
    expect(result.maxWeight).toBe(100);
    expect(result.maxWeightDate).toBe("2026-02-20");
    // 100*(1+5/30)=117, 80*(1+10/30)=107, 90*(1+8/30)=114
    expect(result.maxE1rm).toBe(117);
    // Volume: workout1 = 100*5+80*10=1300, workout2 = 90*8=720
    expect(result.maxVolume).toBe(1300);
  });
});

describe("calculateOverloadSuggestion", () => {
  it("returns null for empty sets", () => {
    expect(calculateOverloadSuggestion([], null)).toBeNull();
  });

  it("suggests weight increase for upper body when all reps hit", () => {
    const sets = [
      { weight: 60, reps: 10 },
      { weight: 60, reps: 10 },
      { weight: 60, reps: 10 },
    ];
    expect(calculateOverloadSuggestion(sets, "Chest")).toEqual({
      weight: 62.5,
      reps: 10,
    });
  });

  it("suggests weight increase of 5 for legs when all reps hit", () => {
    const sets = [
      { weight: 100, reps: 8 },
      { weight: 100, reps: 8 },
    ];
    expect(calculateOverloadSuggestion(sets, "Legs")).toEqual({
      weight: 105,
      reps: 8,
    });
  });

  it("repeats same weight/reps when not all sets hit target", () => {
    const sets = [
      { weight: 60, reps: 10 },
      { weight: 60, reps: 8 },
      { weight: 60, reps: 7 },
    ];
    expect(calculateOverloadSuggestion(sets, "Chest")).toEqual({
      weight: 60,
      reps: 10,
    });
  });

  it("returns null when main weight is 0", () => {
    const sets = [{ weight: 0, reps: 10 }];
    expect(calculateOverloadSuggestion(sets, null)).toBeNull();
  });
});
