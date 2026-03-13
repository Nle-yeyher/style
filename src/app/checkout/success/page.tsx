
import Link from 'next/link';
import { CheckCircle2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CheckoutSuccessPage() {
  return (
    <div className="flex h-[70vh] flex-col items-center justify-center text-center space-y-6">
      <div className="rounded-full bg-green-100 p-6 text-green-600">
        <CheckCircle2 className="h-16 w-16" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline">Order Confirmed</h1>
        <p className="text-muted-foreground">Your payment was successful. We've sent a confirmation email to you.</p>
        <p className="text-sm font-medium">Order Number: #SS-{Math.floor(Math.random() * 1000000)}</p>
      </div>
      <div className="flex gap-4 pt-6">
        <Button asChild className="bg-primary">
          <Link href="/orders">View My Orders</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
