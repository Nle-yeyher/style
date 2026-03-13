
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Mail, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const [email, setEmail] = useState<string>('');
  const [invoice, setInvoice] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const savedEmail = sessionStorage.getItem('customer_email');
    const savedInvoice = sessionStorage.getItem('last_invoice');
    
    if (savedEmail) setEmail(savedEmail);
    if (savedInvoice) setInvoice(JSON.parse(savedInvoice));
  }, []);

  return (
    <div className="mx-auto max-w-2xl flex flex-col items-center justify-center text-center space-y-8 py-12">
      <div className="rounded-full bg-green-100 p-6 text-green-600">
        <CheckCircle2 className="h-16 w-16" />
      </div>
      
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline">¡Gracias por tu compra!</h1>
        <p className="text-muted-foreground">Tu pedido ha sido procesado con éxito.</p>
        <div className="mt-4 inline-block rounded-lg bg-muted px-4 py-2 font-mono text-sm font-bold">
          Número de Pedido: #SS-{orderNumber || '......'}
        </div>
      </div>

      <Card className="w-full border-none bg-accent/5">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-center gap-3 text-primary">
            <Mail className="h-5 w-5" />
            <p className="font-medium text-sm">Factura enviada a: <span className="font-bold">{email || 'tu correo'}</span></p>
          </div>
          <p className="text-xs text-muted-foreground">
            {invoice?.summary || "Hemos enviado un correo electrónico con los detalles de tu compra y la factura adjunta."}
          </p>
        </CardContent>
      </Card>

      {invoice && (
        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
          className="w-full space-y-2"
        >
          <div className="flex items-center justify-between px-4">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Vista previa de la factura
            </h4>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="space-y-2">
            <div 
              className="rounded-xl border bg-white p-8 text-left shadow-inner max-h-[400px] overflow-auto"
              dangerouslySetInnerHTML={{ __html: invoice.invoiceHtml }}
            />
          </CollapsibleContent>
        </Collapsible>
      )}

      <div className="flex flex-col sm:flex-row gap-4 pt-6 w-full sm:w-auto">
        <Button asChild className="bg-primary flex-1">
          <Link href="/orders">Ver mis pedidos</Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/">Continuar comprando</Link>
        </Button>
      </div>
    </div>
  );
}
