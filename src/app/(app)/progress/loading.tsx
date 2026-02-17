import { Skeleton } from "@/components/ui/skeleton";

export default function ProgressLoading() {
  return (
    <div>
      <Skeleton className="mb-3.5 h-[120px] rounded-[14px]" />
      <Skeleton className="mb-3.5 h-[100px] rounded-[14px]" />
      <Skeleton className="mb-3.5 h-[60px] rounded-lg" />
      <Skeleton className="mb-3.5 h-[300px] rounded-[14px]" />
      <Skeleton className="h-[300px] rounded-[14px]" />
    </div>
  );
}
