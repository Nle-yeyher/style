
"use client";

import { use, useEffect, useState } from 'react';
import Image from 'next/image';
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { generateProductDescription } from '@/ai/flows/generate-product-description-flow';
import { ShoppingBag, ArrowLeft, Shield, Truck, RefreshCw, Loader2 } from 'lucide-react';
import Link from 'next/link';
import CompleteTheLook from '@/components/CompleteTheLook';
import AddToCartButton from '@/components/AddToCartButton';
import { Product } from '@/lib/types';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const { id } = use(params);
  const db = useFirestore();
  const { data: product, loading } = useDoc<Product>(
    db ? doc(db, 'products', id) : null
  );

  const [aiDescription, setAiDescription] = useState<string>('');

  useEffect(() => {
    if (product) {
      generateProductDescription({
        name: product.name,
        category: product.category,
        attributes: JSON.stringify({ material: "Premium Fiber", fit: "Modern Minimalist", wash: "Eco-Friendly" })
      }).then(res => setAiDescription(res.description));
    }
  }, [product]);

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Cargando detalles del producto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Producto no encontrado</h1>
        <Button asChild>
          <Link href="/">Volver a la tienda</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" />
        Volver a la Galería
      </Link>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted shadow-sm">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            priority
            className="object-cover"
          />
        </div>

        <div className="flex flex-col justify-center space-y-8">
          <div>
            <span className="mb-2 inline-block text-sm font-bold uppercase tracking-widest text-accent">
              {product.category}
            </span>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl font-headline">{product.name}</h1>
            <p className="mt-4 text-3xl font-light text-foreground">${product.price.toFixed(2)}</p>
          </div>

          <div className="prose prose-sm text-muted-foreground">
            <p className="text-base leading-relaxed">
              {aiDescription || product.description}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold">Stock:</span>
              <span className="text-sm text-muted-foreground">{product.stock} unidades disponibles</span>
            </div>
            <AddToCartButton product={product} />
          </div>

          <div className="grid grid-cols-3 gap-4 border-t pt-8">
            <div className="flex flex-col items-center gap-2 text-center text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">
              <Truck className="h-5 w-5 text-primary" />
              Envío Gratis
            </div>
            <div className="flex flex-col items-center gap-2 text-center text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">
              <RefreshCw className="h-5 w-5 text-primary" />
              30 Días de Devolución
            </div>
            <div className="flex flex-col items-center gap-2 text-center text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">
              <Shield className="h-5 w-5 text-primary" />
              Pago Seguro
            </div>
          </div>
        </div>
      </div>

      <CompleteTheLook mainProduct={product} />
    </div>
  );
}

function Button({ children, asChild, ...props }: any) {
  return <button className="rounded-full bg-primary px-8 py-3 text-white" {...props}>{children}</button>;
}
