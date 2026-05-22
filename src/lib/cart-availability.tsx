import { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CartItemAvailabilityProps {
  items: Array<{
    id: string;
    name: string;
    selectedSize?: string;
    quantity: number;
  }>;
}

export async function checkProductAvailability(productId: string) {
  try {
    const response = await fetch(`/api/products/${productId}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error checking availability:', error);
    return null;
  }
}

export function useCartAvailability(items: any[]) {
  const [unavailableItems, setUnavailableItems] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const checkAvailability = async () => {
      setIsChecking(true);
      const unavailable: string[] = [];

      for (const item of items) {
        const product = await checkProductAvailability(item.id);
        if (!product) {
          unavailable.push(`${item.id}-${item.selectedSize}`);
          continue;
        }

        // Check if the size is still available with the requested quantity
        const sizeStock = product.sizeStock?.find((s: any) => s.size === item.selectedSize);
        if (!sizeStock || sizeStock.stock < item.quantity) {
          unavailable.push(`${item.id}-${item.selectedSize}`);
        }
      }

      setUnavailableItems(unavailable);
      setIsChecking(false);
    };

    if (items.length > 0) {
      checkAvailability();
    }
  }, [items]);

  return { unavailableItems, isChecking };
}

export function CartAvailabilityAlert({
  items,
}: CartItemAvailabilityProps) {
  const { unavailableItems, isChecking } = useCartAvailability(items);

  if (isChecking || unavailableItems.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
      <div className="text-sm">
        <p className="font-semibold text-red-800">
          Algunos items no están disponibles
        </p>
        <p className="text-red-700 text-xs mt-1">
          Algunos productos o tallas que seleccionaste ya no están disponibles. Por favor revisa tu carrito.
        </p>
      </div>
    </div>
  );
}
