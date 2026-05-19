
"use client";

import { useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import SizeSelector from '@/components/SizeSelector';

export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [showSizeSelector, setShowSizeSelector] = useState(false);

  const handleAddToCart = () => {
    // Si el producto tiene tallas, mostrar el selector
    if (product.sizes && product.sizes.length > 0) {
      setShowSizeSelector(true);
    } else {
      // Si no tiene tallas, añadir sin talla
      addToCart(product);
      toast({
        title: "Added to Bag",
        description: `${product.name} has been added to your shopping bag.`
      });
    }
  };

  const handleSizeSelected = (size: string) => {
    addToCart(product, size);
    toast({
      title: "Added to Bag",
      description: `${product.name} (Size: ${size}) has been added to your shopping bag.`
    });
  };

  return (
    <>
      <Button 
        className="h-14 w-full gap-3 bg-primary text-lg" 
        size="lg"
        onClick={handleAddToCart}
      >
        <ShoppingBag className="h-5 w-5" />
        Add to Shopping Bag
      </Button>
      
      <SizeSelector
        product={product}
        open={showSizeSelector}
        onOpenChange={setShowSizeSelector}
        onSizeSelected={handleSizeSelected}
      />
    </>
  );
}
