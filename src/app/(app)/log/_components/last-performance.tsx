import { formatDate } from "@/lib/utils";

interface LastPerformanceProps {
  sets: { weight: number; reps: number }[];
  unit: string;
  date: string;
}

export function LastPerformance({ sets, unit, date }: LastPerformanceProps) {
  const setsStr = sets
    .map((s) => `${s.weight}${unit}\u00D7${s.reps}`)
    .join(", ");

  return (
    <div className="mb-2.5 rounded-md border border-accent/15 bg-accent/[0.08] px-2.5 py-1.5 text-xs text-accent">
      <strong>Last time:</strong> {setsStr}{" "}
      <span className="text-[11px] text-muted-foreground">
        ({formatDate(date)})
      </span>
    </div>
  );
}
