
"use client";

import { useSearchParams } from 'next/navigation';
import { products } from '@/lib/store';
import ProductCard from '@/components/ProductCard';
import { Search } from 'lucide-react';
import { Suspense } from 'react';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q')?.toLowerCase() || '';

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(query) || 
    product.category.toLowerCase().includes(query) ||
    product.description.toLowerCase().includes(query)
  );

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col gap-2 border-b pb-8">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Search className="h-5 w-5" />
          <span className="text-sm font-medium uppercase tracking-widest">Resultados de búsqueda</span>
        </div>
        <h1 className="text-4xl font-bold font-headline">
          {query ? `Resultados para "${query}"` : 'Todos los productos'}
        </h1>
        <p className="text-muted-foreground">
          Encontramos {filteredProducts.length} {filteredProducts.length === 1 ? 'prenda' : 'prendas'} que coinciden con tu búsqueda.
        </p>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="rounded-full bg-muted p-6">
            <Search className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h2 className="text-2xl font-bold">No encontramos coincidencias</h2>
          <p className="text-muted-foreground max-w-md">
            Intenta con otros términos de búsqueda como "azul", "algodón", "pantalones" o "minimalista".
          </p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex h-[50vh] items-center justify-center">Cargando resultados...</div>}>
      <SearchResults />
    </Suspense>
  );
}
