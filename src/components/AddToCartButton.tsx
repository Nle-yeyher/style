
"use client";

import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  return (
    <Button 
      className="h-14 w-full gap-3 bg-primary text-lg" 
      size="lg"
      onClick={() => {
        addToCart(product);
        toast({
          title: "Added to Bag",
          description: `${product.name} has been added to your shopping bag.`
        });
      }}
    >
      <ShoppingBag className="h-5 w-5" />
      Add to Shopping Bag
    </Button>
  );
}
