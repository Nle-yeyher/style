
"use client";

import { useEffect, useState } from 'react';
import { Order } from '@/lib/types';
import { getOrders } from '@/lib/store';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { getOrdersAction } from '@/app/api/users/actions';

export default function OrdersPage() {
  // Normally this would be a server-side fetch from the DB.
  // We'll simulate some mock data if none exists for the demo.
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const loadOrders = async () => {
      if (typeof window === 'undefined') return;

      const userId = sessionStorage.getItem('userId');
      if (userId) {
        const result = await getOrdersAction(userId);
        if (result.success && result.orders) {
          setOrders(result.orders);
          return;
        }
      }

      const saved = getOrders();
      if (saved.length === 0) {
        setOrders([
          {
            id: 'ORD-12345',
            date: '2023-11-15',
            total: 189.99,
            status: 'completed',
            items: [
              { productId: 'p1', name: 'Minimalist T-Shirt', price: 45.0, quantity: 2 },
              { productId: 'p3', name: 'Linen Trousers', price: 99.99, quantity: 1 }
            ]
          },
          {
            id: 'ORD-67890',
            date: '2023-10-22',
            total: 120.0,
            status: 'completed',
            items: [
              { productId: 'p2', name: 'Denim Jacket', price: 120.0, quantity: 1 }
            ]
          }
        ]);
      } else {
        setOrders(saved);
      }
    };

    loadOrders();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline">Order History</h1>
        <p className="text-muted-foreground">Manage and track your recent styles.</p>
      </div>

      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <Package className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">You haven't placed any orders yet.</p>
            <Button asChild variant="outline">
              <Link href="/">Shop the Collection</Link>
            </Button>
          </div>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="overflow-hidden border-none bg-muted/30">
              <CardHeader className="flex-row items-center justify-between bg-muted/50 py-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Order {order.id}</p>
                  <p className="text-sm text-foreground/80">{new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">${order.total.toFixed(2)}</p>
                  <span className="inline-block rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700 uppercase">
                    {order.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center">
                          <ShoppingBag className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Cantidad: {item.quantity}</p>
                          {item.size && (
                            <p className="text-xs text-muted-foreground">Talla: {item.size}</p>
                          )}
                        </div>
                      </div>
                      <p className="font-medium">${(item.price * item.quantity).toLocaleString('es-CO')}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <Button variant="ghost" size="sm" className="gap-2">
                    Order Details <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
