
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} is now in your shopping bag.`,
    });
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl bg-card shadow-sm transition-all hover:shadow-md">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-x-0 bottom-0 translate-y-full p-4 transition-transform duration-300 group-hover:translate-y-0">
            <Button 
              className="w-full gap-2 bg-primary text-primary-foreground" 
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4" />
              Quick Add
            </Button>
          </div>
        </div>
        <div className="flex flex-col p-4">
          <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {product.category}
          </span>
          <h3 className="font-semibold transition-colors group-hover:text-primary">
            {product.name}
          </h3>
          <p className="mt-1 text-lg font-bold text-foreground">
            ${product.price}
          </p>
        </div>
      </Link>
    </div>
  );
}
