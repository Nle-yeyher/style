import { Product } from '@/lib/types';
import ProductModel from '@/lib/models/Product';
import Link from 'next/link';

export default async function Home() {
  const products: Product[] = await (await ProductModel.find({})).lean() as any[];

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary/95 py-32 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-accent blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/50 blur-3xl" />
        </div>
        
        <div className="container relative z-10 px-8 max-w-4xl mx-auto">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight font-headline leading-tight">
              Moda Minimalista<br />
              <span className="text-accent">Premium</span>
            </h1>
            <p className="text-lg text-white/90 max-w-2xl leading-relaxed">
              Descubre nuestra colección curada de prendas, accesorios y calzado diseñados con materiales de alta calidad. Estilo atemporal para quienes valoran la elegancia en la simplicidad.
            </p>
          </div>

          <div className="mt-12 flex flex-wrap gap-4">
            <Link
              href="/search"
              className="inline-flex items-center justify-center rounded-full bg-accent text-primary px-8 py-4 text-sm font-bold transition-all hover:shadow-lg hover:scale-105 active:scale-95"
            >
              Explorar Productos
            </Link>
            <Link
              href="/collections"
              className="inline-flex items-center justify-center rounded-full border-2 border-white/30 backdrop-blur-sm px-8 py-4 text-sm font-bold text-white transition-all hover:bg-white/10 hover:border-white/50 active:scale-95"
            >
              Ver Colecciones
            </Link>
          </div>
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