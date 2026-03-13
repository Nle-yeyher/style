
"use client";

import Link from 'next/link';
import { ShoppingBag, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CartSheetContent } from './CartSheetContent';

export default function Navbar() {
  const { cart } = useCart();
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/" className="text-2xl font-bold tracking-tighter text-primary font-headline">
            STYLESAVVY
          </Link>
        </div>

        <div className="hidden items-center gap-8 text-sm font-medium md:flex">
          <Link href="/" className="transition-colors hover:text-primary">Shop</Link>
          <Link href="/orders" className="transition-colors hover:text-primary">Orders</Link>
          <Link href="#" className="transition-colors hover:text-primary">Collections</Link>
          <Link href="#" className="transition-colors hover:text-primary">About</Link>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                    {itemCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Shopping Cart</SheetTitle>
              </SheetHeader>
              <CartSheetContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
