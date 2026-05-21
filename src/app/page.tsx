import { Product } from '@/lib/types';
import ProductModel from '@/lib/models/Product';
import Link from 'next/link';

export default async function Home() {
  const products: Product[] = await (await ProductModel.find({})).lean() as any[];

  return (
    <div className="space-y-12">
      <section
        className="relative overflow-hidden rounded-3xl bg-cover bg-center bg-no-repeat py-28 text-white shadow-2xl"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(15, 23, 42, 0.72), rgba(15, 23, 42, 0.92)), url('https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1600&q=80')",
          minHeight: '70vh',
        }}
      >
        <div className="absolute inset-0 opacity-50 bg-gradient-to-b from-slate-950/70 via-slate-950/40 to-slate-950/90" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-cyan-400 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-fuchsia-500/50 blur-3xl" />
        </div>

        <div className="container relative z-10 px-6 max-w-4xl mx-auto">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">
              Nueva colección
            </p>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight font-headline leading-tight">
              Estilo moderno para ropa y accesorios únicos
            </h1>
            <p className="max-w-2xl text-lg text-slate-100/90 leading-relaxed">
              Encuentra piezas seleccionadas cuidadosamente, desde prendas esenciales hasta accesorios que elevan cualquier look.
            </p>
          </div>

          <div className="mt-12 flex flex-wrap gap-4">
            <Link
              href="/search"
              className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-8 py-4 text-sm font-bold text-slate-950 transition-all hover:bg-cyan-300 hover:shadow-lg"
            >
              Explorar Productos
            </Link>
            <Link
              href="/collections"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-white/20"
            >
              Ver Colecciones
            </Link>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-3xl bg-slate-950/95 px-6 py-20 shadow-2xl">
        <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 translate-x-16 -translate-y-16 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute left-0 bottom-0 h-72 w-72 -translate-x-16 translate-y-16 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="container relative mx-auto grid gap-10 lg:grid-cols-[1.4fr_0.8fr] items-center px-4">
          <div className="space-y-6 text-slate-100">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/90">Promoción exclusiva</p>
            <h2 className="text-4xl font-bold font-headline md:text-5xl">
              Suscríbete y recibe los mejores looks primero
            </h2>
            <p className="max-w-2xl text-slate-300/90 leading-relaxed">
              Sé el primero en enterarte de nuevos lanzamientos, descuentos exclusivos y tendencias en ropa, zapatos y accesorios.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl shadow-slate-950/20">
                <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Envío rápido</p>
                <p className="mt-3 text-lg font-semibold text-white">Novedades entregadas directamente a tu inbox</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl shadow-slate-950/20">
                <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Descuentos VIP</p>
                <p className="mt-3 text-lg font-semibold text-white">Accede a ofertas especiales antes de todos</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/80">Boletín de moda</p>
            <h3 className="mt-4 text-2xl font-bold text-white">Recibe inspiración y ofertas exclusivas</h3>
            <p className="mt-4 text-slate-300/85">Únete hoy y mantente al tanto de las mejores prendas y complementos.</p>
            <form className="mt-8 space-y-4">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="w-full rounded-full border border-white/10 bg-slate-950/90 px-6 py-4 text-sm text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
              />
              <button className="w-full rounded-full bg-cyan-400 px-6 py-4 text-sm font-bold text-slate-950 transition hover:bg-cyan-300">
                Suscribirse ahora
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}