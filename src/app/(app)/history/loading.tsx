import { Skeleton } from "@/components/ui/skeleton";

export default function HistoryLoading() {
  return (
    <div className="space-y-2.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-[72px] rounded-[14px]" />
      ))}
    </div>
  );
}
