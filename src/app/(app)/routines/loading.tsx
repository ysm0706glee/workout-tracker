import { Skeleton } from "@/components/ui/skeleton";

export default function RoutinesLoading() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[130px] rounded-[14px]" />
        ))}
      </div>
    </div>
  );
}
