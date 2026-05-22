'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buildInvoiceHtml, downloadInvoiceHtml } from '@/lib/invoice';

type OrderItem = {
  name: string;
  price: number;
  quantity: number;
};

type Order = {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: string;
  items: OrderItem[];
};

type UserData = {
  id: string;
  name: string;
  email: string;
};

async function getUser(userId: string) {
  const res = await fetch(`/api/users?user_id=${encodeURIComponent(userId)}`)
  const data = await res.json()
  if (!data.ok) {
    return { success: false, error: data.error || 'No se pudo cargar el usuario.' }
  }
  return { success: true, user: data.data }
}

async function getOrders(userId: string) {
  const res = await fetch(`/api/orders?user_id=${encodeURIComponent(userId)}`)
  const data = await res.json()
  if (!data.ok) {
    return { success: false, error: data.error || 'No se pudieron cargar las órdenes.' }
  }
  return { success: true, orders: data.data }
}

async function updateUser(userId: string, payload: { name: string }) {
  const res = await fetch('/api/users', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: userId, ...payload }),
  })
  const data = await res.json()
  if (!data.ok) {
    return { success: false, error: data.error || 'Error al actualizar el perfil.' }
  }
  return { success: true, user: data.user }
}

async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const res = await fetch('/api/users', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: userId, currentPassword, newPassword }),
  })
  const data = await res.json()
  if (!data.ok) {
    return { success: false, error: data.error || 'Error al cambiar la contraseña.' }
  }
  return { success: true }
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [name, setName] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [selectedInvoiceHtml, setSelectedInvoiceHtml] = useState<string | null>(null);
  const [selectedInvoiceOrderId, setSelectedInvoiceOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      router.push('/login?redirect=/profile');
      return;
    }

    const loadProfile = async () => {
      setError(null);

      const userResult = await getUser(userId);
      if (!userResult.success) {
        setError(userResult.error || 'No se pudo cargar el perfil.');
        return;
      }

      if (userResult.user) {
        setUser(userResult.user);
        setName(userResult.user.name);
      }

      const ordersResult = await getOrders(userId);
      if (ordersResult.success) {
        setOrders(ordersResult.orders);
      }
    };

    loadProfile();
  }, [router]);

  const handleSaveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    if (!user) {
      setError('No hay usuario activo.');
      setLoading(false);
      return;
    }

    if (!name.trim()) {
      setError('El nombre no puede quedar vacío.');
      setLoading(false);
      return;
    }

    const result = await updateUser(user.id, { name: name.trim() });
    if (!result.success) {
      setError(result.error || 'Error al actualizar perfil.');
      setLoading(false);
      return;
    }

    setUser(result.user);
    setMessage('Perfil actualizado correctamente.');
    setLoading(false);
  };

  const handleChangePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    if (!user) {
      setError('No hay usuario activo.');
      setLoading(false);
      return;
    }

    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setError('Completa todos los campos de la contraseña.');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('La nueva contraseña no coincide.');
      setLoading(false);
      return;
    }

    const result = await changePassword(user.id, currentPassword, newPassword);
    if (!result.success) {
      setError(result.error || 'Error al cambiar la contraseña.');
      setLoading(false);
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setMessage('Contraseña actualizada con éxito.');
    setLoading(false);
  };

  const getCustomerName = () => user?.name || 'Cliente';
  const getCustomerEmail = () => user?.email || 'cliente@stylesavvy.com';

  const handleViewInvoice = (order: Order) => {
    const html = buildInvoiceHtml(order, getCustomerName(), getCustomerEmail());
    setSelectedInvoiceHtml(html);
    setSelectedInvoiceOrderId(order.id);
    setIsInvoiceOpen(true);
  };

  const handleDownloadInvoice = (order: Order) => {
    downloadInvoiceHtml(order, getCustomerName(), getCustomerEmail());
  };

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-base text-muted-foreground">Cargando tu cuenta...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-20 px-4">
      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Datos de mi cuenta</CardTitle>
              <p className="text-sm text-muted-foreground">Edita tu nombre y contraseña. El correo se mantiene fijo.</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" value={name} onChange={(event) => setName(event.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={user.email} disabled />
                </div>
                {message ? <p className="text-sm text-green-600">{message}</p> : null}
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar cambios'}</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Cambiar contraseña</CardTitle>
              <p className="text-sm text-muted-foreground">Actualiza tu contraseña para mantener tu cuenta segura.</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Contraseña actual</Label>
                  <Input id="currentPassword" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva contraseña</Label>
                  <Input id="newPassword" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Repetir nueva contraseña</Label>
                  <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
                </div>
                <Button type="submit" disabled={loading}>{loading ? 'Actualizando...' : 'Cambiar contraseña'}</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Mis pedidos</CardTitle>
              <p className="text-sm text-muted-foreground">Revisa el historial de compras realizadas con tu cuenta.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {orders.length === 0 ? (
                <div className="rounded-lg border border-dashed border-muted p-6 text-center">
                  <p className="font-medium">Aún no tienes pedidos registrados en tu cuenta.</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="space-y-3 rounded-lg border border-muted p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold">Pedido {order.orderNumber || order.id}</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.date).toLocaleDateString()}</p>
                      </div>
                      <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold uppercase text-green-700">{order.status}</span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total: <span className="font-semibold">${order.total.toFixed(2)}</span></p>
                      <div className="mt-3 space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="grid grid-cols-[1fr_auto] gap-4 text-sm">
                            <span>{item.name}</span>
                            <span className="font-medium">{item.quantity} x ${item.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewInvoice(order)}>
                          Ver factura
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => handleDownloadInvoice(order)}>
                          Descargar factura
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Dialog open={isInvoiceOpen} onOpenChange={setIsInvoiceOpen}>
        <DialogContent className="max-w-4xl rounded-3xl p-0">
          <DialogHeader>
            <DialogTitle>Factura {selectedInvoiceOrderId}</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[70vh] bg-slate-50 p-4">
            {selectedInvoiceHtml ? (
              <div dangerouslySetInnerHTML={{ __html: selectedInvoiceHtml }} />
            ) : (
              <p className="text-sm text-muted-foreground">No se encontró la factura.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
