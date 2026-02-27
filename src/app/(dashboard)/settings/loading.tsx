import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-3">
        <Skeleton className="w-6 h-6 rounded" />
        <div>
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-4 w-56 mt-1" />
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex lg:flex-col gap-1 lg:w-48">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 rounded-lg" />
          ))}
        </div>
        <div className="flex-1 space-y-4">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
