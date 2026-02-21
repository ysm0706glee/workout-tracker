import { Skeleton } from "@/components/ui/skeleton";

export default function GenerateRoutineLoading() {
  return (
    <div>
      {/* Header */}
      <Skeleton className="mb-1 h-7 w-48" />
      <Skeleton className="mb-6 h-4 w-64" />

      {/* Step indicators */}
      <div className="mb-6 flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-2 flex-1 rounded-full" />
        ))}
      </div>

      {/* Step title */}
      <Skeleton className="mb-4 h-5 w-36" />

      {/* Option cards */}
      <div className="mb-6 space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[68px] rounded-[14px]" />
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
    </div>
  );
}
