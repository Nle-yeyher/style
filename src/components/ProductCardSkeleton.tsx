import { Skeleton } from '@/components/ui/skeleton';

export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-card shadow-sm">
      <Skeleton className="aspect-[3/4] w-full rounded-none" />
      <div className="flex flex-col p-4 space-y-3">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-6 w-1/4 mt-1" />
      </div>
    </div>
  );
}
