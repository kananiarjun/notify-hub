import { Skeleton } from "@/components/ui/skeleton";

export default function LogsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-6 h-6 rounded" />
          <div>
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-56 mt-1" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-20 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-2xl" />
      <div className="flex justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-48" />
      </div>
    </div>
  );
}
