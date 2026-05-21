"use client";

import { useState, useEffect, useCallback, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Plus, Pencil, Trash2, Package, RefreshCw, Loader2, LogOut,
  LayoutDashboard, ShoppingCart, Users, TrendingUp, DollarSign,
  Eye, ChevronDown, ChevronUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/lib/types';
import Image from 'next/image';
import {
  getProductsAction, addProductAction, updateProductAction, deleteProductAction,
  getUsersAction, deleteUserAction, updateUserRoleAction,
  getAllOrdersAction, updateOrderStatusAction,
  getStatsAction,
} from './actions';

type Tab = 'dashboard' | 'products' | 'orders' | 'users';

const SIZES_PRESETS: Record<string, string[]> = {
  'Camisetas': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  'Abrigos':   ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  'Vestidos':  ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  'Pantalones':['28', '30', '32', '34', '36', '38'],
  'Calzado':   ['36', '37', '38', '39', '40', '41'],
  'Accesorios':['Única'],
};

export default function AdminDashboard() {
  const [adminUser, setAdminUser] = useState<string | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const router = useRouter();
  const { toast } = useToast();

  // Products
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sizeStockEdit, setSizeStockEdit] = useState<{ size: string; stock: number; sold: number }[]>([]);
  const [expandedProduct, setExpandedProduct] = useState<number | null>(null);

  // Orders
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Users
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const loadProducts = useCallback(() => {
    setProductsLoading(true);
    getProductsAction().then(setProducts).finally(() => setProductsLoading(false));
  }, []);

  const loadOrders = useCallback(() => {
    setOrdersLoading(true);
    getAllOrdersAction().then(setOrders).finally(() => setOrdersLoading(false));
  }, []);

  const loadUsers = useCallback(() => {
    setUsersLoading(true);
    getUsersAction().then(setUsers).finally(() => setUsersLoading(false));
  }, []);

  const loadStats = useCallback(() => {
    setStatsLoading(true);
    getStatsAction().then(setStats).finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    const storedAdmin = typeof window !== 'undefined' ? sessionStorage.getItem('adminUser') : null;
    setAdminUser(storedAdmin);
    setIsAuthChecked(true);
    if (storedAdmin) {
      loadProducts();
      loadStats();
    }
  }, [loadProducts, loadStats]);

  useEffect(() => {
    if (!adminUser) return;
    if (activeTab === 'orders') loadOrders();
    if (activeTab === 'users') loadUsers();
  }, [activeTab, adminUser, loadOrders, loadUsers]);

  const handleLogout = () => {
    sessionStorage.removeItem('adminUser');
    setAdminUser(null);
    router.push('/');
  };

  // ── Producto form ────────────────────────────────────────────
  const openNewProduct = () => {
    setEditingProduct(null);
    setSizeStockEdit([{ size: 'XS', stock: 10, sold: 0 }, { size: 'S', stock: 10, sold: 0 }, { size: 'M', stock: 10, sold: 0 }, { size: 'L', stock: 10, sold: 0 }, { size: 'XL', stock: 10, sold: 0 }, { size: 'XXL', stock: 10, sold: 0 }]);
    setIsDialogOpen(true);
  };

  const openEditProduct = (product: any) => {
    setEditingProduct(product);
    setSizeStockEdit(product.sizeStock?.length ? [...product.sizeStock] : [{ size: 'XS', stock: 10, sold: 0 }]);
    setIsDialogOpen(true);
  };

  const handleCategoryChange = (category: string) => {
    const preset = SIZES_PRESETS[category];
    if (preset) {
      setSizeStockEdit(preset.map(size => ({ size, stock: 10, sold: 0 })));
    }
  };

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const productData = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      price: parseFloat(formData.get('price') as string),
      description: formData.get('description') as string,
      imageUrl: formData.get('imageUrl') as string || 'https://picsum.photos/seed/new/600/800',
      sizes: sizeStockEdit.map(s => s.size),
      sizeStock: sizeStockEdit,
      suggestions_ids: editingProduct?.suggestions_ids || [],
    };

    try {
      if (editingProduct?.id) {
        await updateProductAction(String(editingProduct.id), productData);
        toast({ title: "Producto actualizado" });
      } else {
        await addProductAction(productData);
        toast({ title: "Producto creado" });
      }
      setIsDialogOpen(false);
      setEditingProduct(null);
      loadProducts();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo guardar el producto." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: any) => {
    if (!confirm("¿Eliminar este producto?")) return;
    try {
      await deleteProductAction(String(id));
      toast({ title: "Producto eliminado" });
      loadProducts();
    } catch {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar." });
    }
  };

  // ── Auth check ───────────────────────────────────────────────
  if (!isAuthChecked) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!adminUser) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Acceso restringido</h1>
          <p className="text-muted-foreground">Debes iniciar sesión como administrador.</p>
          <Button onClick={() => router.push('/login')}>Ir al Login</Button>
        </div>
      </div>
    );
  }

  // ── Tabs ─────────────────────────────────────────────────────
  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products',  label: 'Productos', icon: Package },
    { id: 'orders',    label: 'Pedidos',   icon: ShoppingCart },
    { id: 'users',     label: 'Usuarios',  icon: Users },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Panel de Control</span>
          </div>
          <h1 className="text-3xl font-bold font-headline">Hola, {adminUser.split('@')[0]}</h1>
          <p className="text-muted-foreground">Gestiona tu tienda StyleSavvy.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 w-fit">
          <LogOut className="h-4 w-4" /> Cerrar Sesión
        </Button>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── DASHBOARD ── */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {statsLoading ? (
            <div className="flex h-40 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : stats ? (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                  { label: 'Ingresos totales', value: `$${stats.totalRevenue.toLocaleString('es-CO')}`, icon: DollarSign, color: 'text-green-600' },
                  { label: 'Pedidos', value: stats.totalOrders, icon: ShoppingCart, color: 'text-blue-600' },
                  { label: 'Clientes', value: stats.totalUsers, icon: Users, color: 'text-purple-600' },
                  { label: 'Productos', value: stats.totalProducts, icon: Package, color: 'text-orange-600' },
                ].map(stat => (
                  <Card key={stat.label} className="border-none bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-none shadow-sm">
                  <CardHeader><CardTitle className="text-base">Productos más vendidos</CardTitle></CardHeader>
                  <CardContent>
                    {stats.topProducts.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Aún no hay ventas registradas.</p>
                    ) : (
                      <div className="space-y-3">
                        {stats.topProducts.map((p: any, i: number) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                              <span className="font-medium">{p.name}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-primary">{p.total_sold} uds</span>
                              <span className="text-xs text-muted-foreground ml-2">${parseFloat(p.revenue).toLocaleString('es-CO')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardHeader><CardTitle className="text-base">Pedidos recientes</CardTitle></CardHeader>
                  <CardContent>
                    {stats.recentOrders.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Aún no hay pedidos.</p>
                    ) : (
                      <div className="space-y-3">
                        {stats.recentOrders.map((o: any, i: number) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <div>
                              <p className="font-medium">{o.order_number}</p>
                              <p className="text-xs text-muted-foreground">{o.user_name}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">${parseFloat(o.total).toLocaleString('es-CO')}</p>
                              <Badge variant={o.status === 'completed' ? 'default' : 'secondary'} className="text-[10px]">
                                {o.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* ── PRODUCTOS ── */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Productos ({products.length})</h2>
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingProduct(null); }}>
              <DialogTrigger asChild>
                <Button className="gap-2" onClick={openNewProduct}><Plus className="h-4 w-4" /> Nuevo Producto</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSaveProduct} className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre</Label>
                      <Input id="name" name="name" defaultValue={editingProduct?.name} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoría</Label>
                      <Input id="category" name="category" defaultValue={editingProduct?.category}
                        onChange={e => handleCategoryChange(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Precio (COP$)</Label>
                      <Input id="price" name="price" type="number" step="1000" defaultValue={editingProduct?.price} required />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="imageUrl">URL Imagen</Label>
                      <Input id="imageUrl" name="imageUrl" defaultValue={editingProduct?.imageUrl} placeholder="https://..." />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea id="description" name="description" defaultValue={editingProduct?.description} required />
                  </div>

                  {/* Stock por talla */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Stock por talla</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() =>
                        setSizeStockEdit(prev => [...prev, { size: '', stock: 10, sold: 0 }])
                      }>+ Talla</Button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {sizeStockEdit.map((ss, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Input
                            placeholder="Talla"
                            value={ss.size}
                            onChange={e => setSizeStockEdit(prev => prev.map((s, i) => i === idx ? { ...s, size: e.target.value } : s))}
                            className="w-20"
                          />
                          <Input
                            type="number"
                            placeholder="Stock"
                            value={ss.stock}
                            onChange={e => setSizeStockEdit(prev => prev.map((s, i) => i === idx ? { ...s, stock: parseInt(e.target.value) || 0 } : s))}
                            className="w-24"
                          />
                          <span className="text-xs text-muted-foreground">vendidos: {ss.sold}</span>
                          <Button type="button" variant="ghost" size="sm" className="text-destructive px-2"
                            onClick={() => setSizeStockEdit(prev => prev.filter((_, i) => i !== idx))}>✕</Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {productsLoading ? (
            <div className="flex h-40 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <Card className="border-none shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-[60px]">Img</TableHead>
                    <TableHead>Nombre / Categoría</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const totalStock = product.sizeStock?.reduce((s: number, ss: any) => s + ss.stock, 0) || 0;
                    return (
                      <>
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="relative h-12 w-10 overflow-hidden rounded border">
                              <Image src={product.imageUrl} alt={product.name} fill sizes="40px" className="object-cover" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-bold">{product.name}</div>
                            <div className="text-xs text-muted-foreground uppercase">{product.category}</div>
                          </TableCell>
                          <TableCell className="font-mono font-bold">${product.price.toLocaleString('es-CO')}</TableCell>
                          <TableCell>
                            <button
                              onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
                              className="flex items-center gap-1"
                            >
                              <span className={`rounded-full px-2 py-1 text-xs font-bold ${totalStock < 5 ? 'bg-destructive/10 text-destructive' : 'bg-green-100 text-green-700'}`}>
                                {totalStock} uds
                              </span>
                              {expandedProduct === product.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </button>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditProduct(product)}>
                                <Pencil className="h-4 w-4 text-primary" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        {expandedProduct === product.id && (
                          <TableRow key={`${product.id}-detail`}>
                            <TableCell colSpan={5} className="bg-muted/20 py-2">
                              <div className="flex flex-wrap gap-2 px-2">
                                {product.sizeStock?.map((ss: any) => (
                                  <div key={ss.size} className="text-xs bg-background border rounded px-2 py-1">
                                    <span className="font-bold">{ss.size}</span>: {ss.stock} disp. / {ss.sold} vendidos
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      )}

      {/* ── PEDIDOS ── */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Pedidos ({orders.length})</h2>
            <Button variant="outline" size="sm" onClick={loadOrders} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Actualizar
            </Button>
          </div>

          {ordersLoading ? (
            <div className="flex h-40 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : orders.length === 0 ? (
            <Card className="border-none shadow-sm"><CardContent className="py-12 text-center text-muted-foreground">No hay pedidos aún.</CardContent></Card>
          ) : (
            <Card className="border-none shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead>Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Items</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono font-bold text-primary">{order.orderNumber}</TableCell>
                      <TableCell>
                        <div className="font-medium">{order.userName || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground">{order.userEmail}</div>
                      </TableCell>
                      <TableCell className="font-bold">${order.total.toLocaleString('es-CO')}</TableCell>
                      <TableCell>
                        <select
                          value={order.status}
                          onChange={async (e) => {
                            await updateOrderStatusAction(order.id, e.target.value);
                            setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: e.target.value } : o));
                          }}
                          className="text-xs border rounded px-2 py-1 bg-background"
                        >
                          <option value="completed">Completado</option>
                          <option value="pending">Pendiente</option>
                          <option value="failed">Fallido</option>
                          <option value="shipped">Enviado</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString('es-CO')}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      )}

      {/* ── USUARIOS ── */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Usuarios ({users.length})</h2>
            <Button variant="outline" size="sm" onClick={loadUsers} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Actualizar
            </Button>
          </div>

          {usersLoading ? (
            <div className="flex h-40 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : users.length === 0 ? (
            <Card className="border-none shadow-sm"><CardContent className="py-12 text-center text-muted-foreground">No hay usuarios.</CardContent></Card>
          ) : (
            <Card className="border-none shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Registro</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <select
                          value={user.role}
                          onChange={async (e) => {
                            await updateUserRoleAction(user.id, e.target.value);
                            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: e.target.value } : u));
                            toast({ title: 'Rol actualizado' });
                          }}
                          className="text-xs border rounded px-2 py-1 bg-background"
                        >
                          <option value="customer">Cliente</option>
                          <option value="admin">Admin</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString('es-CO')}
                      </TableCell>
                      <TableCell className="text-right">
                        {user.role !== 'admin' && (
                          <Button
                            variant="ghost" size="icon"
                            onClick={async () => {
                              if (!confirm(`¿Eliminar a ${user.name}?`)) return;
                              await deleteUserAction(user.id);
                              setUsers(prev => prev.filter(u => u.id !== user.id));
                              toast({ title: 'Usuario eliminado' });
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
