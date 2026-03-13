
import { products } from '@/lib/store';
import ProductCard from '@/components/ProductCard';

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl bg-primary py-24 text-white">
        <div className="container relative z-10 px-8">
          <h1 className="max-w-2xl text-5xl font-bold tracking-tight md:text-7xl font-headline">
            La Esencia de la <br />
            <span className="text-accent">Simplicidad Moderna</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-primary-foreground/80">
            Descubre una colección curada de ropa minimalista diseñada para quienes aprecian las líneas limpias, los materiales premium y la estética atemporal.
          </p>
          <div className="mt-10 flex gap-4">
            <button className="rounded-full bg-accent px-8 py-4 text-sm font-bold transition-transform hover:scale-105">
              Explorar Ahora
            </button>
            <button className="rounded-full border border-white/20 px-8 py-4 text-sm font-bold backdrop-blur-sm transition-colors hover:bg-white/10">
              Novedades
            </button>
          </div>
        </div>
        <div className="absolute right-0 top-0 hidden h-full w-1/2 opacity-20 md:block">
           {/* Decorative background element or image could go here */}
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold font-headline">Piezas Seleccionadas</h2>
            <p className="text-muted-foreground">Curadas para tu elegancia diaria.</p>
          </div>
          <button className="text-sm font-bold text-primary hover:underline">Ver Todo</button>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
      
      <section className="rounded-3xl bg-muted py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold font-headline">Únete a StyleSavvy</h2>
          <p className="mt-4 text-muted-foreground">Obtén acceso anticipado a lanzamientos y consejos de estilo exclusivos.</p>
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
