import { Skeleton } from "@/components/ui/skeleton";

export default function TemplatesLoading() {
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
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
      <Skeleton className="h-4 w-40" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-4 w-32" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
