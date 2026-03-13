
"use client";

import { useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { Loader2, CreditCard, ShieldCheck } from 'lucide-react';

export default function CheckoutPage() {
  const { cart, total, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  if (cart.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">Your bag is empty</h2>
        <Button onClick={() => router.push('/')}>Return to Shop</Button>
      </div>
    );
  }

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment gateway interaction (Mercado Pago / Wompi)
    setTimeout(() => {
      setIsProcessing(false);
      clearCart();
      router.push('/checkout/success');
    }, 2000);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-12">
      <h1 className="text-3xl font-bold font-headline">Secure Checkout</h1>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="space-y-8">
          <form onSubmit={handleCheckout} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Shipping Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" required />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold">Payment Method</h3>
              <div className="rounded-xl border p-4">
                <div className="flex items-center gap-4">
                  <CreditCard className="h-6 w-6 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-bold">Credit Card</p>
                    <p className="text-xs text-muted-foreground">Secure payment powered by Mercado Pago</p>
                  </div>
                </div>
              </div>
            </div>

            <Button className="w-full bg-primary" size="lg" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>Pay ${total.toFixed(2)} Now</>
              )}
            </Button>
            
            <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              Your payment information is encrypted and secure.
            </p>
          </form>
        </div>

        <div className="rounded-2xl bg-muted/50 p-8">
          <h3 className="mb-6 text-lg font-bold">Order Summary</h3>
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.name} (x{item.quantity})</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-4 font-bold">
              <div className="flex justify-between">
                <span>Total</span>
                <span className="text-xl text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
