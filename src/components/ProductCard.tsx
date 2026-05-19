
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import ProductModal from '@/components/ProductModal';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [showModal, setShowModal] = useState(false);

  // Calcular stock total disponible
  const totalStock = product.sizeStock
    ? product.sizeStock.reduce((sum, s) => sum + s.stock, 0)
    : 10;

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowModal(true);
  };

  return (
    <>
      <div className="group relative flex flex-col overflow-hidden rounded-xl bg-card shadow-sm transition-all hover:shadow-md">
        <button 
          onClick={handleImageClick}
          className="block text-left"
        >
          <div className="relative aspect-[3/4] overflow-hidden bg-muted cursor-pointer">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-x-0 bottom-0 translate-y-full p-4 transition-transform duration-300 group-hover:translate-y-0">
              <Button 
                className="w-full gap-2 bg-primary text-primary-foreground" 
                onClick={handleImageClick}
              >
                <ShoppingCart className="h-4 w-4" />
                Ver detalles
              </Button>
            </div>
          </div>
        </button>
        
        <div className="flex flex-col p-4">
          <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {product.category}
          </span>
          <h3 className="font-semibold transition-colors hover:text-primary cursor-pointer" onClick={handleImageClick}>
            {product.name}
          </h3>
          <div className="mt-1 flex items-center justify-between">
            <p className="text-lg font-bold text-foreground">
              ${product.price.toLocaleString('es-CO')}
            </p>
            <span className={cn(
              "text-xs font-medium px-2 py-1 rounded-md",
              totalStock > 0
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            )}>
              {totalStock > 0 ? `${totalStock} en stock` : 'Agotado'}
            </span>
          </div>
        </div>
      </div>

      <ProductModal 
        product={product}
        open={showModal}
        onOpenChange={setShowModal}
      />
    </>
  );
}

import { cn } from '@/lib/utils';
