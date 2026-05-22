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
  Eye, ChevronDown, ChevronUp, Search
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
  const [searchQuery, setSearchQuery] = useState('');

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

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredProducts = normalizedSearch
    ? products.filter((product) =>
        `${product.name} ${product.category} ${product.description}`
          .toLowerCase()
          .includes(normalizedSearch)
      )
    : products;

  const filteredOrders = normalizedSearch
    ? orders.filter((order) =>
        `${order.orderNumber} ${order.userName || ''} ${order.userEmail || ''} ${order.status}`
          .toLowerCase()
          .includes(normalizedSearch)
      )
    : orders;

  const filteredUsers = normalizedSearch
    ? users.filter((user) =>
        `${user.name} ${user.email} ${user.role}`
          .toLowerCase()
          .includes(normalizedSearch)
      )
    : users;

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
    sessionStorage.removeItem('customerUser');
    sessionStorage.removeItem('customerEmail');
    sessionStorage.removeItem('userId');
    window.dispatchEvent(new Event('stylesavvy-auth-change'));
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

  // ── Sidebar items ─────────────────────────────────────────────
  const sidebarItems: { id: Tab; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'products',  label: 'Inventario', icon: Package },
    { id: 'orders',    label: 'Pedidos', icon: ShoppingCart },
    { id: 'users',     label: 'Usuarios', icon: Users },
  ];

  return (
    <div className="bg-slate-100 h-screen w-full overflow-hidden">
      <div className="flex h-screen w-full overflow-hidden">
        <aside className="hidden xl:flex w-80 flex-col bg-slate-950 text-white">
          <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500 text-lg font-bold">LS</div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Logística</p>
              <h2 className="text-xl font-semibold">StyleSavvy</h2>
            </div>
          </div>

          <div className="border-b border-white/10 px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-xl font-bold text-white">
                {adminUser.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold">{adminUser.split('@')[0]}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Administrador</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-6">
            <div className="space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition ${
                    activeTab === item.id
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </div>
          </nav>

          <div className="border-t border-white/10 px-6 py-5">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Más</p>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 hover:bg-white/10">Informes</button>
              <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 hover:bg-white/10">Configuración</button>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-auto h-screen">
          <div className="border-b border-slate-200 bg-white px-6 py-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-slate-500">Bienvenido de nuevo, {adminUser.split('@')[0]}</p>
                <h1 className="text-3xl font-bold tracking-tight">Almacén e Inventario</h1>
                <p className="text-sm text-slate-500">Visión general de tus operaciones de comercio.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    placeholder="Buscar productos, pedidos o usuarios..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm shadow-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" onClick={handleLogout} className="ml-2 flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Cerrar Sesión
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 max-w-[1800px] mx-auto">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { title: 'Ventas Totales', value: `$${stats?.totalRevenue.toLocaleString('es-CO') ?? '0'}`, description: 'Ingresos acumulados' },
                    { title: 'Pedidos', value: stats?.totalOrders ?? 0, description: 'Pedidos procesados' },
                    { title: 'Clientes', value: stats?.totalUsers ?? 0, description: 'Clientes registrados' },
                    { title: 'Productos', value: stats?.totalProducts ?? 0, description: 'Productos en catálogo' },
                  ].map((card) => (
                    <Card key={card.title} className="overflow-hidden border-none shadow-sm min-h-[160px]">
                      <CardContent className="space-y-3 p-5">
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-900 shadow-sm">
                          <span className="text-base font-semibold">•</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-slate-500">{card.title}</p>
                          <p className="text-2xl font-bold">{card.value}</p>
                        </div>
                        <p className="text-sm text-slate-500">{card.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <Card className="border-none shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">Rotación de Inventario</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-500">
                      Un panorama rápido de cómo se mueve el stock. Aquí visualizas tendencias de ventas y prioridades para reabastecer.
                    </CardContent>
                  </Card>
                  <Card className="border-none shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">Pronóstico de Demanda</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-500">
                      Proyección de la demanda para tus colecciones principales y recomendaciones de stock.
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <Card className="border-none shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">Productos más vendidos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {stats?.topProducts?.length ? (
                        <div className="space-y-3">
                          {stats.topProducts.map((item: any, index: number) => (
                            <div key={index} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                              <div>
                                <p className="font-semibold">{item.name}</p>
                                <p className="text-xs text-slate-500">Vendidos: {item.total_sold}</p>
                              </div>
                              <p className="text-sm font-bold text-slate-900">${parseFloat(item.revenue || 0).toLocaleString('es-CO')}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">No hay datos de productos vendidos todavía.</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">Pedidos recientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {stats?.recentOrders?.length ? (
                        <div className="space-y-3">
                          {stats.recentOrders.map((order: any, index: number) => (
                            <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                              <div className="flex items-center justify-between gap-4">
                                <div>
                                  <p className="font-semibold">{order.order_number}</p>
                                  <p className="text-xs text-slate-500">{order.user_name || 'Sin cliente'}</p>
                                </div>
                                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">{order.status}</span>
                              </div>
                              <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                                <span>{new Date(order.created_at).toLocaleDateString('es-CO')}</span>
                                <span>${parseFloat(order.total || 0).toLocaleString('es-CO')}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">No hay pedidos recientes.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="mt-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Inventario</p>
                    <h2 className="text-2xl font-semibold">Productos</h2>
                  </div>
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
                            <Input id="category" name="category" defaultValue={editingProduct?.category} onChange={e => handleCategoryChange(e.target.value)} required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="price">Precio (COP$)</Label>
                            <Input id="price" name="price" type="number" step="1000" defaultValue={editingProduct?.price} required />
                          </div>
                          <div className="space-y-2 col-span-2">
                            <Label htmlFor="imageUrl">URL de imagen</Label>
                            <Input id="imageUrl" name="imageUrl" defaultValue={editingProduct?.imageUrl} placeholder="https://..." />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Descripción</Label>
                          <Textarea id="description" name="description" defaultValue={editingProduct?.description} required />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Stock por talla</Label>
                            <Button type="button" variant="outline" size="sm" onClick={() => setSizeStockEdit(prev => [...prev, { size: '', stock: 10, sold: 0 }])}>+ Talla</Button>
                          </div>
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {sizeStockEdit.map((ss, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <Input placeholder="Talla" value={ss.size} onChange={e => setSizeStockEdit(prev => prev.map((s, i) => i === idx ? { ...s, size: e.target.value } : s))} className="w-20" />
                                <Input type="number" placeholder="Stock" value={ss.stock} onChange={e => setSizeStockEdit(prev => prev.map((s, i) => i === idx ? { ...s, stock: parseInt(e.target.value) || 0 } : s))} className="w-24" />
                                <span className="text-xs text-slate-500">vendidos: {ss.sold}</span>
                                <Button type="button" variant="ghost" size="sm" className="text-destructive px-2" onClick={() => setSizeStockEdit(prev => prev.filter((_, i) => i !== idx))}>✕</Button>
                              </div>
                            ))}
                          </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          {editingProduct ? 'Guardar cambios' : 'Crear producto'}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {productsLoading ? (
                  <div className="flex h-40 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : filteredProducts.length === 0 ? (
                  <Card className="border-none shadow-sm"><CardContent className="py-12 text-center text-slate-500">No hay productos que coincidan con la búsqueda.</CardContent></Card>
                ) : (
                  <Card className="border-none shadow-sm overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead>ID</TableHead>
                          <TableHead>Producto</TableHead>
                          <TableHead>Precio</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.map((product) => {
                          const totalStock = product.sizeStock?.reduce((sum: number, stockItem: any) => sum + stockItem.stock, 0) || 0;
                          return (
                            <TableRow key={product.id}>
                              <TableCell className="font-mono text-sm text-slate-600">{product.id}</TableCell>
                              <TableCell>
                                <div className="font-semibold">{product.name}</div>
                                <div className="text-xs text-slate-500">{product.category}</div>
                              </TableCell>
                              <TableCell className="font-mono text-sm">${product.price.toLocaleString('es-CO')}</TableCell>
                              <TableCell>
                                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${totalStock > 10 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                  {totalStock} uds
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="icon" onClick={() => openEditProduct(product)}>
                                    <Pencil className="h-4 w-4 text-slate-600" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="mt-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Pedidos</p>
                    <h2 className="text-2xl font-semibold">Gestión de Pedidos</h2>
                  </div>
                  <Button variant="outline" size="sm" onClick={loadOrders} className="gap-2">Actualizar</Button>
                </div>

                {ordersLoading ? (
                  <div className="flex h-40 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : orders.length === 0 ? (
                  <Card className="border-none shadow-sm"><CardContent className="py-12 text-center text-slate-500">No hay pedidos registrados.</CardContent></Card>
                ) : filteredOrders.length === 0 ? (
                  <Card className="border-none shadow-sm"><CardContent className="py-12 text-center text-slate-500">No hay pedidos que coincidan con la búsqueda.</CardContent></Card>
                ) : (
                  <Card className="border-none shadow-sm overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead>Pedido</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead className="text-right">Items</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono text-sm text-slate-600">{order.orderNumber}</TableCell>
                            <TableCell>
                              <div className="font-semibold">{order.userName || 'Cliente anónimo'}</div>
                              <div className="text-xs text-slate-500">{order.userEmail || '-'}</div>
                            </TableCell>
                            <TableCell className="font-mono text-sm">${parseFloat(order.total || 0).toLocaleString('es-CO')}</TableCell>
                            <TableCell>
                              <select
                                value={order.status}
                                onChange={async (e) => {
                                  await updateOrderStatusAction(order.id, e.target.value);
                                  setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: e.target.value } : o));
                                }}
                                className="text-xs border rounded px-2 py-1 bg-white"
                              >
                                <option value="completed">Completado</option>
                                <option value="pending">Pendiente</option>
                                <option value="failed">Fallido</option>
                                <option value="shipped">Enviado</option>
                              </select>
                            </TableCell>
                            <TableCell className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString('es-CO')}</TableCell>
                            <TableCell className="text-right text-xs text-slate-500">{order.items?.length ?? 0} {order.items?.length === 1 ? 'item' : 'items'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div className="mt-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Usuarios</p>
                    <h2 className="text-2xl font-semibold">Gestión de Usuarios</h2>
                  </div>
                  <Button variant="outline" size="sm" onClick={loadUsers} className="gap-2">Actualizar</Button>
                </div>

                {usersLoading ? (
                  <div className="flex h-40 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : users.length === 0 ? (
                  <Card className="border-none shadow-sm"><CardContent className="py-12 text-center text-slate-500">No hay usuarios registrados.</CardContent></Card>
                ) : filteredUsers.length === 0 ? (
                  <Card className="border-none shadow-sm"><CardContent className="py-12 text-center text-slate-500">No hay usuarios que coincidan con la búsqueda.</CardContent></Card>
                ) : (
                  <Card className="border-none shadow-sm overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead>Nombre</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Rol</TableHead>
                          <TableHead>Registro</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell className="text-sm text-slate-500">{user.email}</TableCell>
                            <TableCell>
                              <select
                                value={user.role}
                                onChange={async (e) => {
                                  await updateUserRoleAction(user.id, e.target.value);
                                  setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: e.target.value } : u));
                                  toast({ title: 'Rol actualizado' });
                                }}
                                className="text-xs border rounded px-2 py-1 bg-white"
                              >
                                <option value="customer">Cliente</option>
                                <option value="admin">Admin</option>
                              </select>
                            </TableCell>
                            <TableCell className="text-xs text-slate-500">{new Date(user.created_at).toLocaleDateString('es-CO')}</TableCell>
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
        </main>
      </div>
    </div>
  );
}
