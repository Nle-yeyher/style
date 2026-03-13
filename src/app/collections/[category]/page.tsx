
"use client";

import { use } from 'react';
import { products } from '@/lib/store';
import ProductCard from '@/components/ProductCard';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface CollectionDetailPageProps {
  params: Promise<{ category: string }>;
}

export default function CollectionDetailPage({ params }: CollectionDetailPageProps) {
  const { category } = use(params);
  
  // Buscamos productos que coincidan con la categoría (ignorando mayúsculas/minúsculas)
  const filteredProducts = products.filter(
    p => p.category.toLowerCase() === category.toLowerCase()
  );

  if (filteredProducts.length === 0) {
    return notFound();
  }

  const categoryDisplayName = filteredProducts[0].category;

  return (
    <div className="space-y-12 pb-20">
      <div className="space-y-6">
        <Link 
          href="/collections" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Colecciones
        </Link>
        
        <div className="border-b pb-8">
          <h1 className="text-4xl font-bold font-headline capitalize">
            Colección {categoryDisplayName}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Descubre nuestra selección exclusiva de {categoryDisplayName.toLowerCase()}, combinando comodidad y estilo atemporal.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filteredProducts.length > 0 && (
        <div className="flex flex-col items-center justify-center py-12 border-t mt-12 text-center">
          <p className="text-muted-foreground text-sm">Has llegado al final de la colección {categoryDisplayName.toLowerCase()}.</p>
          <Link href="/collections" className="mt-4 font-bold text-primary hover:underline">
            Explorar otras colecciones
          </Link>
        </div>
      )}
    </div>
  );
}
