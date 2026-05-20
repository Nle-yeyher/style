"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useCart } from '@/hooks/use-cart';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CartSheetContent } from './CartSheetContent';
import { Input } from '@/components/ui/input';

export default function Navbar() {
  const { cart } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerName, setCustomerName] = useState('');
  const router = useRouter();
  
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const refreshCustomer = () => {
      const storedCustomer = sessionStorage.getItem('customerUser');
      setCustomerName(storedCustomer || '');
    };

    refreshCustomer();

    window.addEventListener('stylesavvy-auth-change', refreshCustomer);
    return () => {
      window.removeEventListener('stylesavvy-auth-change', refreshCustomer);
    };
  }, []);

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleLogout = () => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem('customerUser');
    sessionStorage.removeItem('customerEmail');
    sessionStorage.removeItem('userId');
    window.dispatchEvent(new Event('stylesavvy-auth-change'));
    router.push('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

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
          <Link href="/collections" className="transition-colors hover:text-primary">Colecciones</Link>
          <Link href="/about" className="transition-colors hover:text-primary">Nosotros</Link>
        </div>

        <div className="flex items-center gap-2">
          {isSearchOpen ? (
            <form onSubmit={handleSearch} className="relative flex items-center animate-in fade-in slide-in-from-right-4 duration-300">
              <Input
                autoFocus
                type="text"
                placeholder="Buscar prendas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-[150px] md:w-[250px] rounded-full pr-10"
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="absolute right-0 h-9 w-9 rounded-full"
                onClick={() => setIsSearchOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
              <Search className="h-5 w-5" />
            </Button>
          )}

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
                <SheetTitle>Bolsa de Compra</SheetTitle>
              </SheetHeader>
              <CartSheetContent />
            </SheetContent>
          </Sheet>

          {customerName ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={`Abrir menú de usuario para ${customerName}`}
                  className="ml-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold uppercase text-white shadow-sm transition hover:bg-primary/90"
                >
                  {getInitials(customerName)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8} className="w-48">
                <div className="px-2 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">Cuenta</div>
                <DropdownMenuItem asChild>
                  <Link href="/profile">Mi Perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders">Mis Pedidos</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/collections">Tienda</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout}>Cerrar Sesión</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" asChild className="ml-2">
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
