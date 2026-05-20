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
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
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
    addToCart(product);
    toast({
      title: 'Añadido a la bolsa',
      description: `${product.name} ha sido añadido a tu carrito.`,
    });
    onOpenChange(false);
  };

  const totalStock = sizeAvailability.reduce((sum, item) => sum + item.available, 0);
  const hasStockInfo = product.sizeStock && product.sizeStock.length > 0;
  const isOutOfStock = hasStockInfo ? totalStock <= 0 : false;
  const availabilityText = hasStockInfo
    ? totalStock > 0
      ? 'Disponible'
      : 'Agotado'
    : 'Stock no disponible';

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
          {/* Imagen del producto */}
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

          {/* Detalles del producto */}
          <div className="space-y-6">
            {/* Precio */}
            <div>
              <p className="text-3xl font-bold text-primary">
                ${product.price.toLocaleString('es-CO')}
              </p>
            </div>

            {/* Descripción */}
            <div>
              <h3 className="font-semibold mb-2">Descripción</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            <div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-muted-foreground">
                <p className="font-semibold">Disponibilidad</p>
                <p>{availabilityText}</p>
              </div>
            </div>

            <Button
              onClick={handleAddToCart}
              className="w-full h-12 gap-2 text-base"
              disabled={isOutOfStock}
            >
              <ShoppingBag className="h-5 w-5" />
              Añadir a la bolsa
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
