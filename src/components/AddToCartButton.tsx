
"use client";

import { useMemo } from 'react';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const totalStock = useMemo<number | undefined>(() => {
    if (product.sizeStock && product.sizeStock.length > 0) {
      return product.sizeStock.reduce((sum, item) => sum + item.stock, 0);
    }
    return undefined;
  }, [product.sizeStock]);

  const isOutOfStock = totalStock !== undefined ? totalStock <= 0 : false;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product);
    toast({
      title: 'Añadido a la bolsa',
      description: `${product.name} ha sido añadido a tu carrito.`,
    });
  };

  return (
    <div className="space-y-4">
      <Button
        className="h-14 w-full gap-3 bg-primary text-lg"
        size="lg"
        onClick={handleAddToCart}
        disabled={isOutOfStock}
      >
        <ShoppingBag className="h-5 w-5" />
        {isOutOfStock ? 'Agotado' : 'Añadir a la bolsa'}
      </Button>
    </div>
  );
}
