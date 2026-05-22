import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="space-y-12 pb-20">
      <div className="space-y-4 border-b pb-8">
        <h1 className="text-4xl font-bold font-headline">Contáctanos</h1>
        <p className="text-muted-foreground max-w-2xl">
          Estamos aquí para ayudarte con tus preguntas sobre productos, envíos, devoluciones y recomendaciones de estilo.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.9fr_0.9fr]">
        <div className="rounded-3xl bg-white p-10 shadow-lg shadow-slate-900/5">
          <h2 className="text-2xl font-bold">¿Necesitas ayuda?</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Escríbenos y nuestro equipo de estilo te responderá lo antes posible. También puedes contactarnos por WhatsApp si necesitas asesoría personalizada.
          </p>

          <div className="mt-10 space-y-6">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
                <Mail className="h-6 w-6" />
              </span>
              <div>
                <p className="font-semibold">Email</p>
                <p className="text-muted-foreground">admin@stylesavvy.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
                <Phone className="h-6 w-6" />
              </span>
              <div>
                <p className="font-semibold">Teléfono</p>
                <p className="text-muted-foreground">+57 311 387 4432</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
                <MapPin className="h-6 w-6" />
              </span>
              <div>
                <p className="font-semibold">Ubicación</p>
                <p className="text-muted-foreground">Quibdo, Colombia</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-muted p-10 shadow-lg shadow-slate-900/5">
          <h2 className="text-2xl font-bold text-white">Envía tu mensaje</h2>
          <form className="mt-8 space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">Nombre</label>
              <input type="text" placeholder="Tu nombre" className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">Correo</label>
              <input type="email" placeholder="tu@email.com" className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">Mensaje</label>
              <textarea placeholder="¿En qué podemos ayudarte?" rows={5} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20" />
            </div>
            <button type="submit" className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300">
              Enviar mensaje
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
