
"use client";

import { useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { Loader2, CreditCard, ShieldCheck, Landmark, Wallet } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { generateInvoice } from '@/ai/flows/generate-invoice-flow';
import { saveOrder } from '@/lib/store';

export default function CheckoutPage() {
  const { cart, total, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    zip: ''
  });
  const router = useRouter();

  if (cart.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">Tu bolsa está vacía</h2>
        <Button onClick={() => router.push('/')}>Volver a la tienda</Button>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      const orderNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      
      // Generar factura con IA
      const invoice = await generateInvoice({
        orderNumber: `SS-${orderNumber}`,
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerEmail: formData.email,
        items: cart.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total: total,
        date: new Date().toLocaleDateString('es-AR')
      });

      // Guardar pedido localmente
      saveOrder({
        id: `SS-${orderNumber}`,
        date: new Date().toISOString(),
        total: total,
        status: 'completed',
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      });

      // Simular retraso de procesamiento y envío de email
      setTimeout(() => {
        setIsProcessing(false);
        clearCart();
        // Guardar la factura en sessionStorage para mostrarla en la página de éxito
        sessionStorage.setItem('last_invoice', JSON.stringify(invoice));
        sessionStorage.setItem('customer_email', formData.email);
        router.push(`/checkout/success?order=${orderNumber}`);
      }, 2000);
    } catch (error) {
      console.error("Error en el checkout:", error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-12 pb-20">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline">Finalizar Compra</h1>
        <p className="text-muted-foreground">Completa tu información para procesar el pedido.</p>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-10">
          <form id="checkout-form" onSubmit={handleCheckout} className="space-y-10">
            {/* Sección de Envío */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 border-b pb-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">1</div>
                <h3 className="text-lg font-bold uppercase tracking-tight">Detalles de Envío</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input id="firstName" placeholder="Juan" required onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input id="lastName" placeholder="Pérez" required onChange={handleInputChange} />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" type="email" placeholder="juan@ejemplo.com" required onChange={handleInputChange} />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="address">Dirección Completa</Label>
                  <Input id="address" placeholder="Calle 123 #45-67, Depto 4B" required onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input id="city" placeholder="Buenos Aires" required onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">Código Postal</Label>
                  <Input id="zip" placeholder="C1425" required onChange={handleInputChange} />
                </div>
              </div>
            </section>

            {/* Sección de Pago */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 border-b pb-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">2</div>
                <h3 className="text-lg font-bold uppercase tracking-tight">Método de Pago</h3>
              </div>

              <RadioGroup 
                defaultValue="card" 
                onValueChange={setPaymentMethod}
                className="grid grid-cols-1 gap-4 sm:grid-cols-3"
              >
                <div>
                  <RadioGroupItem value="card" id="card" className="peer sr-only" />
                  <Label
                    htmlFor="card"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <CreditCard className="mb-3 h-6 w-6" />
                    <span className="text-sm font-bold">Tarjeta</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="transfer" id="transfer" className="peer sr-only" />
                  <Label
                    htmlFor="transfer"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <Landmark className="mb-3 h-6 w-6" />
                    <span className="text-sm font-bold">Transferencia</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="wallet" id="wallet" className="peer sr-only" />
                  <Label
                    htmlFor="wallet"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <Wallet className="mb-3 h-6 w-6" />
                    <span className="text-sm font-bold">Billetera Virtual</span>
                  </Label>
                </div>
              </RadioGroup>

              {paymentMethod === 'card' && (
                <Card className="border-none bg-muted/30">
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Número de Tarjeta</Label>
                      <div className="relative">
                        <Input 
                          id="cardNumber" 
                          placeholder="0000 0000 0000 0000" 
                          className="pl-10"
                          maxLength={19}
                          required 
                        />
                        <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Vencimiento (MM/AA)</Label>
                        <Input id="expiry" placeholder="MM/AA" maxLength={5} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" maxLength={4} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardName">Nombre en la Tarjeta</Label>
                      <Input id="cardName" placeholder="Como aparece en la tarjeta" required />
                    </div>
                  </CardContent>
                </Card>
              )}
            </section>

            <Button 
              type="submit"
              className="w-full bg-primary py-8 text-lg font-bold" 
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generando Factura y Enviando Correo...
                </>
              ) : (
                <>Finalizar Pago ${total.toFixed(2)}</>
              )}
            </Button>
            
            <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              Tu transacción está protegida y se enviará una factura a tu email.
            </p>
          </form>
        </div>

        {/* Resumen del Lado Derecho */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <Card className="border-none bg-card shadow-lg">
              <CardContent className="p-6">
                <h3 className="mb-6 text-lg font-bold font-headline border-b pb-4">Resumen del Pedido</h3>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div className="flex-1 pr-4">
                        <p className="font-medium leading-none">{item.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Cantidad: {item.quantity}</p>
                      </div>
                      <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  
                  <div className="space-y-2 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Envío</span>
                      <span className="text-green-600 font-medium">Gratis</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex items-end justify-between">
                        <span className="text-base font-bold">Total</span>
                        <div className="text-right">
                          <span className="block text-2xl font-bold text-primary">${total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
