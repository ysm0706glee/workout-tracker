import { formatDate } from "@/lib/utils";

interface PRCardProps {
  maxWeight: number;
  date: string;
  unit: string;
}

export function PRCard({ maxWeight, date, unit }: PRCardProps) {
  return (
    <div className="mb-3.5 flex items-center gap-3.5 rounded-[14px] border border-gold/30 bg-gradient-to-br from-gold/10 to-primary/10 p-4">
      <div className="text-[28px]">&#127942;</div>
      <div className="flex-1">
        <div className="text-xs font-bold uppercase tracking-wider text-gold">
          Weight PR
        </div>
        <div className="mt-0.5 text-[22px] font-bold">
          {maxWeight} {unit}
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {formatDate(date)}
        </div>
      </div>
    </div>
  );
}
