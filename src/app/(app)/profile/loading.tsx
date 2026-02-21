import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div>
      <Skeleton className="mb-4 h-7 w-20" />

      {/* Stats grid */}
      <div className="mb-4 grid grid-cols-3 gap-2.5">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[88px] rounded-[14px]" />
        ))}
      </div>

      {/* Member since */}
      <Skeleton className="mx-auto mb-4 h-4 w-40" />

      {/* Profile form */}
      <Skeleton className="mb-4 h-[160px] rounded-[14px]" />

      {/* Notification settings */}
      <Skeleton className="h-[100px] rounded-[14px]" />

      {/* Log out button */}
      <div className="mt-6 flex justify-center">
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  );
}
