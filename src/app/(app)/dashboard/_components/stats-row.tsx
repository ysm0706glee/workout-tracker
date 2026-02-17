import { Card, CardContent } from "@/components/ui/card";

interface StatsRowProps {
  total: number;
  thisWeek: number;
  streak: number;
}

export function StatsRow({ total, thisWeek, streak }: StatsRowProps) {
  const stats = [
    { value: total, label: "Workouts" },
    { value: thisWeek, label: "This Week" },
    { value: streak, label: "Day Streak" },
  ];

  return (
    <div className="mb-3.5 grid grid-cols-3 gap-2.5">
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
  );
}
