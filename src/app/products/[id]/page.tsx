import Image from 'next/image';
import { generateProductDescription } from '@/ai/flows/generate-product-description-flow';
import { ShoppingBag, ArrowLeft, Shield, Truck, RefreshCw, Loader2 } from 'lucide-react';
import Link from 'next/link';
import CompleteTheLook from '@/components/CompleteTheLook';
import AddToCartButton from '@/components/AddToCartButton';
import { Product } from '@/lib/types';
import dbConnect from '@/lib/mysql';
import ProductModel from '@/lib/models/Product';
import { notFound } from 'next/navigation';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  await dbConnect();

  let productDoc = null;
  try {
    productDoc = await ProductModel.findById(id).lean();
  } catch(e) {
    // invalid id format for mongodb likely
  }

  if (!productDoc) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Producto no encontrado</h1>
        <Link href="/" className="rounded-full bg-primary px-8 py-3 text-white">Volver a la tienda</Link>
      </div>
    );
  }

  const product: Product = {
    id: productDoc.id.toString(),
    name: productDoc.name,
    description: productDoc.description,
    price: productDoc.price,
    imageUrl: productDoc.imageUrl,
    category: productDoc.category,
    sizes: productDoc.sizes || [],
    sizeStock: productDoc.sizeStock || [],
    suggestions_ids: productDoc.suggestions_ids || [],
  };

  let aiDescription = '';
  try {
    const aiRes = await generateProductDescription({
      name: product.name,
      category: product.category,
      attributes: JSON.stringify({ material: "Premium Fiber", fit: "Modern Minimalist", wash: "Eco-Friendly" })
    });
    if (aiRes && aiRes.description) {
      aiDescription = aiRes.description;
    }
  } catch(e) {
    // fallback to original desc
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
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col justify-center space-y-8">
          <div>
            <span className="mb-2 inline-block text-sm font-bold uppercase tracking-widest text-accent">
              {product.category}
            </span>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl font-headline">{product.name}</h1>
            <p className="mt-4 text-3xl font-light text-foreground">${product.price.toLocaleString('es-CO')}</p>
          </div>

          <div className="prose prose-sm text-muted-foreground">
            <p className="text-base leading-relaxed">
              {aiDescription || product.description}
            </p>
          </div>

          <div className="space-y-4">
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
