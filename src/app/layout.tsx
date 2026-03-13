
import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import { CartProvider } from '@/hooks/use-cart';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'StyleSavvy | Minimalismo Moderno en Ropa',
  description: 'Eleva tu armario con piezas de moda minimalistas y de corte limpio.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body min-h-screen bg-background text-foreground antialiased selection:bg-accent/30">
        <CartProvider>
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
