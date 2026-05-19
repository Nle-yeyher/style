
import Link from 'next/link';
import Image from 'next/image';
import { products } from '@/lib/store';

import { ChevronRight } from 'lucide-react';

export default function CollectionsPage() {
  // Extraemos categorías únicas y una imagen representativa
  const categories = Array.from(new Set(products.map(p => p.category)));
  
  const collections = categories.map(category => {
    const representativeProduct = products.find(p => p.category === category);
    return {
      name: category,
      slug: category.toLowerCase(),
      image: representativeProduct?.imageUrl || 'https://picsum.photos/seed/coll/600/800',
      count: products.filter(p => p.category === category).length
    };
  });

  return (
    <div className="space-y-12 pb-20">
      <div className="space-y-2 border-b pb-8 text-center sm:text-left">
        <h1 className="text-4xl font-bold font-headline">Nuestras Colecciones</h1>
        <p className="text-muted-foreground max-w-2xl">
          Explora nuestras selecciones curadas, diseñadas para elevar cada aspecto de tu armario minimalista.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => (
          <Link 
            key={collection.name} 
            href={`/collections/${collection.slug}`}
            className="group block overflow-hidden rounded-2xl bg-muted"
          >
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={collection.image}
                alt={collection.name}
                fill
                loading="eager"
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <span className="text-xs font-bold uppercase tracking-widest text-accent">
                  {collection.count} {collection.count === 1 ? 'Pieza' : 'Piezas'}
                </span>
                <h3 className="text-2xl font-bold font-headline capitalize">{collection.name}</h3>
              </div>
              <div className="absolute bottom-6 right-6 h-10 w-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white opacity-0 transition-opacity group-hover:opacity-100">
                <ChevronRight className="h-6 w-6" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <section className="rounded-3xl bg-primary py-16 text-white text-center">
        <h2 className="text-2xl font-bold font-headline">¿Buscas algo específico?</h2>
        <p className="mt-2 text-primary-foreground/80">Usa nuestro buscador para encontrar exactamente lo que necesitas.</p>
        <div className="mt-8 flex justify-center">
          <Link 
            href="/search" 
            className="rounded-full bg-accent px-8 py-3 text-sm font-bold transition-transform hover:scale-105"
          >
            Ver Todo el Catálogo
          </Link>
        </div>
      </section>
    </div>
  );
}
