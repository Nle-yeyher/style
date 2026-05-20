"use client";

import { useMemo, useState } from 'react';
import { Product } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SizeSelectorProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSizeSelected: (size: string) => void;
}

export default function SizeSelector({
  product,
  open,
  onOpenChange,
  onSizeSelected,
}: SizeSelectorProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const sizeAvailability = useMemo(() => {
    if (product.sizeStock && product.sizeStock.length > 0) {
      return product.sizeStock.map((size) => ({
        size: size.size,
        available: size.stock,
        sold: size.sold,
        isAvailable: size.stock > 0,
      }));
    }

    return (product.sizes || ['S', 'M', 'L', 'XL', 'XXL']).map((size) => ({
      size,
      available: 0,
      sold: 0,
      isAvailable: true,
    }));
  }, [product.sizeStock, product.sizes]);

  const handleConfirm = () => {
    if (selectedSize) {
      onSizeSelected(selectedSize);
      setSelectedSize(null);
      onOpenChange(false);
    }
  };

  const selectedAvailability = sizeAvailability.find((item) => item.size === selectedSize);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Seleccionar talla</DialogTitle>
          <DialogDescription>
            Elige la talla para {product.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-5 gap-2">
            {sizeAvailability.map((item) => (
              <button
                key={item.size}
                type="button"
                onClick={() => setSelectedSize(item.size)}
                disabled={!item.isAvailable}
                className={cn(
                  "py-3 px-2 border-2 rounded-lg font-semibold transition-all text-xs",
                  selectedSize === item.size
                    ? "border-primary bg-primary text-white"
                    : item.isAvailable
                    ? "border-gray-300 hover:border-primary"
                    : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                )}
              >
                {item.size}
              </button>
            ))}
          </div>

          {selectedAvailability ? (
            <div className={cn(
              "rounded-xl border p-4 text-sm",
              selectedAvailability.isAvailable
                ? 'border-green-200 bg-green-50 text-green-800'
                : 'border-red-200 bg-red-50 text-red-800'
            )}>
              {selectedAvailability.isAvailable ? (
                <>
                  <p className="font-semibold">Talla disponible</p>
                  <p>{selectedAvailability.available} unidades en stock</p>
                  <p className="text-xs text-muted-foreground">Vendidas: {selectedAvailability.sold}</p>
                </>
              ) : (
                <>
                  <p className="font-semibold">Talla agotada</p>
                  <p>Por favor elige otra talla o regresa más tarde.</p>
                </>
              )}
            </div>
          ) : null}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            disabled={!selectedSize || !selectedAvailability?.isAvailable}
            onClick={handleConfirm}
            className="gap-2"
          >
            <ShoppingBag className="h-4 w-4" />
            Añadir a la bolsa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
