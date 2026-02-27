import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-3">
        <Skeleton className="w-6 h-6 rounded" />
        <div>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64 mt-1" />
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="lg:col-span-2 h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}
