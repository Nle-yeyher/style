
"use client";

import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';

export function CartSheetContent() {
  const { cart, removeFromCart, updateQuantity, total } = useCart();
  const router = useRouter();

  if (cart.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <ShoppingBag className="h-12 w-12 text-muted-foreground opacity-20" />
        <p className="text-muted-foreground">Tu bolsa está vacía actualmente.</p>
        <Button onClick={() => router.push('/')} variant="outline">Empezar a comprar</Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col py-6">
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-6">
          {cart.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-md border">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">${item.price}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="mt-auto space-y-4 pt-6">
        <Separator />
        <div className="flex items-center justify-between font-bold">
          <span>Subtotal</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <Button className="w-full bg-primary" onClick={() => router.push('/checkout')}>
          Tramitar Pedido
        </Button>
      </div>
    </div>
  );
}
