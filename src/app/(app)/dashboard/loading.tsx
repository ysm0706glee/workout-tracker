import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div>
      <div className="mb-3.5 grid grid-cols-3 gap-2.5">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[88px] rounded-[14px]" />
        ))}
      </div>
      <Skeleton className="mb-3.5 h-12 rounded-lg" />
      <Skeleton className="h-[300px] rounded-[14px]" />
    </div>
  );
}
