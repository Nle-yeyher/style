import { Product } from '@/lib/types';
import dbConnect from '@/lib/mongodb';
import ProductModel from '@/lib/models/Product';
import Link from 'next/link';
import Image from 'next/image';

export default async function Home() {
  await dbConnect();
  const productsDocs = await ProductModel.find({}).lean() as any[];
  const products: Product[] = productsDocs.map(doc => ({
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description,
    price: doc.price,
    imageUrl: doc.imageUrl,
    category: doc.category,
    sizes: doc.sizes || [],
    sizeStock: doc.sizeStock || [],
    suggestions_ids: doc.suggestions_ids || [],
  }));

  // Obtener categorías únicas
  const categories = Array.from(new Set(products.map(p => p.category)));
  const collections = categories.slice(0, 6).map(category => {
    const categoryProducts = products.filter(p => p.category === category);
    const representativeProduct = categoryProducts[0];
    return {
      name: category,
      slug: category.toLowerCase().replace(/\s+/g, '-'),
      image: representativeProduct?.imageUrl || 'https://picsum.photos/seed/coll/600/800',
      count: categoryProducts.length
    };
  });

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl bg-primary py-24 text-white">
        <div className="container relative z-10 px-8">
          <h1 className="max-w-2xl text-5xl font-bold tracking-tight md:text-7xl font-headline">
            Ropa Minimalista, <br />
            <span className="text-accent">Accesorios y Calzado</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-primary-foreground/80">
            Descubre nuestra colección de prendas de vestir, accesorios modernos y calzado premium. Diseñados con materiales de alta calidad para un estilo atemporal.
          </p>
          <div className="mt-10 flex gap-4">
            <button className="rounded-full bg-accent px-8 py-4 text-sm font-bold transition-transform hover:scale-105">
              Ver Productos
            </button>
            <button className="rounded-full border border-white/20 px-8 py-4 text-sm font-bold backdrop-blur-sm transition-colors hover:bg-white/10">
              Ver Colecciones
            </button>
          </div>
        </div>
        <div className="absolute right-0 top-0 hidden h-full w-1/2 opacity-20 md:block">
           {/* Decorative background element or image could go here */}
        </div>
      </section>

      <section className="space-y-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-muted py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold font-headline">Únete a StyleSavvy</h2>
          <p className="mt-4 text-muted-foreground">Obtén acceso anticipado a nuevos productos de ropa, accesorios y calzado.</p>
          <div className="mt-8 flex justify-center">
            <div className="flex w-full max-w-md gap-2">
              <input 
                type="email" 
                placeholder="Tu correo electrónico" 
                className="flex-1 rounded-full border bg-background px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary/90">
                Suscribirse
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
