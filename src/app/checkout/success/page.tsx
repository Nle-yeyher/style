
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CheckoutSuccessPage() {
  const [orderNumber, setOrderNumber] = useState<string>('');

  useEffect(() => {
    // Generamos el número de orden solo en el cliente para evitar errores de hidratación
    setOrderNumber(Math.floor(Math.random() * 1000000).toString().padStart(6, '0'));
  }, []);

  return (
    <div className="flex h-[70vh] flex-col items-center justify-center text-center space-y-6">
      <div className="rounded-full bg-green-100 p-6 text-green-600">
        <CheckCircle2 className="h-16 w-16" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline">Pedido Confirmado</h1>
        <p className="text-muted-foreground">Tu pago fue exitoso. Te hemos enviado un correo electrónico de confirmación.</p>
        <p className="text-sm font-medium">Número de Pedido: #SS-{orderNumber || '......'}</p>
      </div>
      <div className="flex gap-4 pt-6">
        <Button asChild className="bg-primary">
          <Link href="/orders">Ver mis pedidos</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Continuar comprando</Link>
        </Button>
      </div>
    </div>
  );
}
