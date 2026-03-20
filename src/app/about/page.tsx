import Image from 'next/image';
import { CheckCircle2, Leaf, Heart, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[60vh] overflow-hidden rounded-3xl bg-primary flex items-center justify-center text-center text-white px-6">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://picsum.photos/seed/about-hero/1200/800"
            alt="StyleSavvy Studio"
            fill
            className="object-cover opacity-30 grayscale"
            data-ai-hint="fashion studio"
          />
        </div>
        <div className="relative z-10 max-w-3xl space-y-6">
          <h1 className="text-5xl font-bold font-headline md:text-7xl">Nuestra Historia</h1>
          <p className="text-xl text-primary-foreground/90">
            Redefiniendo el armario moderno a través de la simplicidad y el consumo consciente.
          </p>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold font-headline">Menos es Más</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            En STYLESAVVY, creemos que la verdadera elegancia no grita, sino que susurra. Nacimos de la necesidad de escapar del ciclo de la moda rápida y regresar a lo esencial: cortes impecables, materiales nobles y una estética que trasciende las temporadas.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 text-accent" />
              <p className="font-medium">Diseño Atemporal</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 text-accent" />
              <p className="font-medium">Materiales Premium</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 text-accent" />
              <p className="font-medium">Producción Ética</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 text-accent" />
              <p className="font-medium">Calidad Duradera</p>
            </div>
          </div>
        </div>
        <div className="relative aspect-square overflow-hidden rounded-2xl shadow-xl">
          <Image
            src="https://picsum.photos/seed/philosophy/800/800"
            alt="Philosophy"
            fill
            className="object-cover"
            data-ai-hint="minimalist clothing"
          />
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-muted rounded-3xl p-12 md:p-20 text-center space-y-12">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold font-headline">Nuestros Valores</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto italic">
            "La simplicidad es la máxima sofisticación." — Leonardo da Vinci
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-background p-8 rounded-2xl shadow-sm space-y-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Leaf className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold font-headline">Sustentabilidad</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Seleccionamos fibras naturales y procesos de teñido de bajo impacto para minimizar nuestra huella en el planeta.
            </p>
          </div>

          <div className="bg-background p-8 rounded-2xl shadow-sm space-y-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Heart className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold font-headline">Pasión por el Detalle</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Cada costura y cada botón son revisados para asegurar que recibas una pieza que ames durante años.
            </p>
          </div>

          <div className="bg-background p-8 rounded-2xl shadow-sm space-y-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold font-headline">Transparencia</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Creemos en la honestidad sobre nuestros procesos y precios, construyendo una relación de confianza contigo.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-10 space-y-6">
        <h2 className="text-2xl font-bold font-headline">¿Quieres saber más?</h2>
        <p className="text-muted-foreground">Estamos aquí para ayudarte a construir el armario de tus sueños.</p>
        <a 
          href="mailto:hola@stylesavvy.com" 
          className="inline-block rounded-full bg-primary px-8 py-3 text-sm font-bold text-white transition-transform hover:scale-105"
        >
          Contáctanos
        </a>
      </section>
    </div>
  );
}
