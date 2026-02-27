import { Skeleton } from "@/components/ui/skeleton";

export default function SendLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-3">
        <Skeleton className="w-6 h-6 rounded" />
        <div>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64 mt-1" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </div>
  );
}
