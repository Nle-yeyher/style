import { Skeleton } from '@/components/ui/skeleton';

export default function CollectionsLoading() {
  return (
    <div className="space-y-12 pb-20">
      <div className="space-y-4 border-b pb-8 text-center sm:text-left">
        <Skeleton className="h-10 w-64 mx-auto sm:mx-0" />
        <Skeleton className="h-5 w-full max-w-2xl mx-auto sm:mx-0" />
        <Skeleton className="h-5 w-3/4 max-w-xl mx-auto sm:mx-0" />
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/5] rounded-2xl w-full" />
        ))}
      </div>
    </div>
  );
}
