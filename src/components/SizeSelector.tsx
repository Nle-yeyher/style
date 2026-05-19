"use client";

import { useState } from 'react';
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

  const handleConfirm = () => {
    if (selectedSize) {
      onSizeSelected(selectedSize);
      setSelectedSize(null);
      onOpenChange(false);
    }
  };

  const sizes = product.sizes || ['S', 'M', 'L', 'XL', 'XXL'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Size</DialogTitle>
          <DialogDescription>
            Choose a size for {product.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-5 gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={cn(
                  "py-3 px-2 border-2 rounded-lg font-semibold transition-all",
                  selectedSize === size
                    ? "border-primary bg-primary text-white"
                    : "border-gray-300 hover:border-primary"
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            disabled={!selectedSize}
            onClick={handleConfirm}
            className="gap-2"
          >
            <ShoppingBag className="h-4 w-4" />
            Add to Bag
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
