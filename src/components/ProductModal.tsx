"use client";

import { useState, useEffect } from 'react';
import { Product, SizeAvailability } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShoppingBag, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeAvailability, setSizeAvailability] = useState<SizeAvailability[]>([]);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    // Generar disponibilidad de tallas
    if (product.sizeStock && product.sizeStock.length > 0) {
      setSizeAvailability(
        product.sizeStock.map(size => ({
          size: size.size,
          available: size.stock,
          sold: size.sold,
          isAvailable: size.stock > 0,
        }))
      );
    } else if (product.sizes) {
      // Fallback si no hay sizeStock definido
      setSizeAvailability(
        product.sizes.map(size => ({
          size,
          available: 10,
          sold: 0,
          isAvailable: true,
        }))
      );
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: "Error",
        description: "Por favor selecciona una talla",
        variant: "destructive"
      });
      return;
    }

    const selected = sizeAvailability.find(s => s.size === selectedSize);
    if (!selected || !selected.isAvailable) {
      toast({
        title: "No disponible",
        description: `La talla ${selectedSize} no está disponible en este momento`,
        variant: "destructive"
      });
      return;
    }

    addToCart(product, selectedSize);
    toast({
      title: "Añadido a la bolsa",
      description: `${product.name} (Talla: ${selectedSize}) ha sido añadido a tu carrito.`
    });
    
    onOpenChange(false);
    setSelectedSize(null);
  };

  const selectedAvailability = sizeAvailability.find(s => s.size === selectedSize);

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

            {/* Selector de talla con disponibilidad */}
            <div>
              <h3 className="font-semibold mb-3">Selecciona tu talla</h3>
              <div className="grid grid-cols-4 gap-2">
                {sizeAvailability.map((size) => (
                  <button
                    key={size.size}
                    onClick={() => setSelectedSize(size.size)}
                    disabled={!size.isAvailable}
                    className={cn(
                      "py-2 px-2 border-2 rounded-lg font-semibold transition-all text-xs",
                      selectedSize === size.size
                        ? "border-primary bg-primary text-white"
                        : size.isAvailable
                        ? "border-gray-300 hover:border-primary cursor-pointer"
                        : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                    )}
                  >
                    {size.size}
                  </button>
                ))}
              </div>
            </div>

            {/* Información de disponibilidad */}
            {selectedSize && selectedAvailability && (
              <div className={cn(
                "p-3 rounded-lg border flex gap-2",
                selectedAvailability.isAvailable
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              )}>
                {selectedAvailability.isAvailable ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-green-800">
                        Disponible
                      </p>
                      <p className="text-green-700">
                        {selectedAvailability.available} unidades en stock
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Vendidas: {selectedAvailability.sold}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-red-800">
                        No disponible
                      </p>
                      <p className="text-red-700">
                        Esta talla está agotada en este momento
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Botón añadir al carrito */}
            <Button
              onClick={handleAddToCart}
              disabled={!selectedSize || !selectedAvailability?.isAvailable}
              className="w-full h-12 gap-2 text-base"
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
