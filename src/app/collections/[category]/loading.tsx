import { Skeleton } from '@/components/ui/skeleton';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CollectionCategoryLoading() {
  return (
    <div className="space-y-12 pb-20">
      <div className="space-y-6">
        <Button 
          variant="outline" 
          asChild 
          className="rounded-full gap-2 w-fit transition-all hover:bg-primary hover:text-primary-foreground group"
        >
          <Link href="/collections">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Volver a Colecciones
          </Link>
        </Button>
        
        <div className="border-b pb-8 space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-full max-w-2xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
