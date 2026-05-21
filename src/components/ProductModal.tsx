"use client";

import { useEffect, useState } from 'react';
import { Product, SizeAvailability } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ProductModalProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProductModal({
  product,
  open,
  onOpenChange,
}: ProductModalProps) {
  const [sizeAvailability, setSizeAvailability] = useState<SizeAvailability[]>([]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    setSelectedSize(null);
    if (product.sizeStock && product.sizeStock.length > 0) {
      setSizeAvailability(
        product.sizeStock.map(size => ({
          size: size.size,
          available: size.stock,
          sold: size.sold,
          isAvailable: size.stock > 0,
        }))
      );
    } else {
      setSizeAvailability([]);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (sizeAvailability.length > 0 && !selectedSize) {
      toast({
        title: 'Selecciona una talla',
        description: 'Por favor elige una talla antes de añadir al carrito.',
        variant: 'destructive',
      });
      return;
    }
    addToCart(product, selectedSize || undefined);
    toast({
      title: 'Añadido a la bolsa',
      description: `${product.name}${selectedSize ? ` (${selectedSize})` : ''} ha sido añadido a tu carrito.`,
    });
    onOpenChange(false);
  };

  const totalStock = sizeAvailability.reduce((sum, item) => sum + item.available, 0);
  const hasStockInfo = sizeAvailability.length > 0;
  const isOutOfStock = hasStockInfo && totalStock <= 0;
  const selectedStockInfo = sizeAvailability.find(s => s.size === selectedSize);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{product.name}</DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            {product.category}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Imagen */}
          <div className="flex items-center justify-center">
            <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-muted">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Detalles */}
          <div className="space-y-5">
            <p className="text-3xl font-bold text-primary">
              ${product.price.toLocaleString('es-CO')}
            </p>

            <div>
              <h3 className="font-semibold mb-1">Descripción</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Tallas */}
            {hasStockInfo && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Talla</h3>
                  {selectedSize && selectedStockInfo && (
                    <span className="text-xs text-muted-foreground">
                      {selectedStockInfo.available} disponibles
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizeAvailability.map((s) => (
                    <button
                      key={s.size}
                      onClick={() => s.isAvailable && setSelectedSize(s.size)}
                      className={cn(
                        "relative px-3 py-1.5 text-sm font-medium rounded-md border transition-all",
                        s.isAvailable
                          ? selectedSize === s.size
                            ? "bg-primary text-white border-primary"
                            : "bg-background hover:border-primary hover:text-primary"
                          : "opacity-40 cursor-not-allowed line-through bg-muted"
                      )}
                      title={s.isAvailable ? `${s.available} en stock` : 'Agotado'}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock total */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-muted-foreground">Disponibilidad</span>
                <span className={cn(
                  "font-bold",
                  isOutOfStock ? "text-red-500" : "text-green-600"
                )}>
                  {isOutOfStock ? "Agotado" : `${totalStock} unidades`}
                </span>
              </div>
              {!isOutOfStock && !selectedSize && (
                <p className="text-xs text-muted-foreground mt-1">Selecciona una talla para ver disponibilidad exacta</p>
              )}
            </div>

            <Button
              onClick={handleAddToCart}
              className="w-full h-12 gap-2 text-base"
              disabled={isOutOfStock}
            >
              <ShoppingBag className="h-5 w-5" />
              {selectedSize ? `Añadir talla ${selectedSize}` : 'Añadir a la bolsa'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}