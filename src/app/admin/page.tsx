"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Package, RefreshCw, Loader2, LogOut, LayoutDashboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/lib/types';
import Image from 'next/image';
import { getProductsAction, addProductAction, updateProductAction, deleteProductAction } from './actions';

export default function AdminDashboard() {
  const [adminUser, setAdminUser] = useState<string | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [adminEmail, setAdminEmail] = useState('admin@stylesavvy.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadProducts = () => {
    setProductsLoading(true);
    getProductsAction()
      .then(setProducts)
      .finally(() => setProductsLoading(false));
  };

  useEffect(() => {
    const storedAdmin = typeof window !== 'undefined' ? sessionStorage.getItem('adminUser') : null;
    setAdminUser(storedAdmin);
    setIsAuthChecked(true);
    loadProducts();
  }, []);

  const handleAdminLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (adminEmail === 'admin@stylesavvy.com' && adminPassword === 'admin123') {
      sessionStorage.setItem('adminUser', adminEmail);
      setAdminUser(adminEmail);
      setLoginError(null);
      loadProducts();
      return;
    }
    setLoginError('Credenciales inválidas. Usa admin@stylesavvy.com / admin123');
  };

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('adminUser');
    }
    setAdminUser(null);
    router.push('/');
  };

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const productData = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      price: parseFloat(formData.get('price') as string),
      stock: parseInt(formData.get('stock') as string),
      description: formData.get('description') as string,
      imageUrl: formData.get('imageUrl') as string || 'https://picsum.photos/seed/new/600/800',
      suggestions_ids: editingProduct?.suggestions_ids || [],
    };

    try {
      if (editingProduct?.id) {
        await updateProductAction(editingProduct.id, productData);
        toast({ title: "Producto actualizado" });
      } else {
        await addProductAction(productData);
        toast({ title: "Producto creado" });
      }
      setIsDialogOpen(false);
      setEditingProduct(null);
      loadProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo guardar el producto." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;
    try {
      await deleteProductAction(id);
      toast({ title: "Producto eliminado" });
      loadProducts();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el producto." });
    }
  };

  if (!isAuthChecked) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!adminUser) {
    return (
      <div className="mx-auto max-w-md py-20 px-4">
        <div className="rounded-3xl border bg-background p-10 shadow-sm">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">Acceso de Administrador</h1>
            <p className="text-muted-foreground">Inicia sesión para gestionar productos y colecciones.</p>
          </div>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminEmail">Email</Label>
              <Input
                id="adminEmail"
                value={adminEmail}
                onChange={(event) => setAdminEmail(event.target.value)}
                type="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminPassword">Contraseña</Label>
              <Input
                id="adminPassword"
                value={adminPassword}
                onChange={(event) => setAdminPassword(event.target.value)}
                type="password"
                required
              />
            </div>
            {loginError ? <p className="text-sm text-destructive">{loginError}</p> : null}
            <Button type="submit" className="w-full">Iniciar Sesión</Button>
            <p className="text-sm text-muted-foreground">
              Usa <strong>admin@stylesavvy.com</strong> y contraseña <strong>admin123</strong>.
            </p>
          </form>
        </div>
      </div>
    );
  }

  const categories = Array.from(new Set(products.map(p => p.category)));
  const collections = categories.map((category) => {
    const items = products.filter((p) => p.category === category);
    return {
      name: category,
      count: items.length,
      totalStock: items.reduce((sum, product) => {
        if (product.sizeStock && product.sizeStock.length > 0) {
          return sum + product.sizeStock.reduce((s: any, ss: any) => s + ss.stock, 0);
        }
        return sum + 10; // fallback
      }, 0),
    };
  });

  const user = { displayName: adminUser.split('@')[0] };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Panel de Control</span>
          </div>
          <h1 className="text-3xl font-bold font-headline">Hola, {user.displayName}</h1>
          <p className="text-muted-foreground">Gestiona el inventario global de la tienda.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" /> Seguir Comprando
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingProduct(null);
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Nuevo Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveProduct} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input id="name" name="name" defaultValue={editingProduct?.name} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría</Label>
                    <Input id="category" name="category" defaultValue={editingProduct?.category} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Precio (COP$)</Label>
                    <Input id="price" name="price" type="number" step="1000" defaultValue={editingProduct?.price} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input id="stock" name="stock" type="number" defaultValue={editingProduct?.stock} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">URL de la Imagen</Label>
                  <Input id="imageUrl" name="imageUrl" defaultValue={editingProduct?.imageUrl} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción Corta</Label>
                  <Textarea id="description" name="description" defaultValue={editingProduct?.description} required />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {productsLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="bg-primary/5 border-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
                <Package className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Bajo Stock (&lt; 5)</CardTitle>
                <RefreshCw className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {products.filter(p => p.stock < 5).length}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">Colecciones</h2>
                <p className="text-muted-foreground">Visualiza las categorías que hay en la tienda.</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection) => (
                <Card key={collection.name} className="border-none shadow-sm">
                  <CardContent>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Colección</p>
                        <h3 className="text-xl font-semibold">{collection.name}</h3>
                      </div>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                        {collection.count}
                      </span>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">
                      Stock total: {collection.totalStock} unidades
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="border-none shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-[80px]">Imagen</TableHead>
                  <TableHead>Nombre / Categoría</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="relative h-12 w-10 overflow-hidden rounded border">
                        <Image src={product.imageUrl} alt={product.name} fill sizes="100vw" className="object-cover" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold">{product.name}</div>
                      <div className="text-xs text-muted-foreground uppercase">{product.category}</div>
                    </TableCell>
                    <TableCell className="font-mono font-bold">${product.price.toLocaleString('es-CO')}</TableCell>
                    <TableCell>
                      {(() => {
                        const totalStock = product.sizeStock && product.sizeStock.length > 0 
                          ? product.sizeStock.reduce((sum, s) => sum + s.stock, 0)
                          : 10;
                        return (
                          <span className={`rounded-full px-2 py-1 text-xs font-bold ${totalStock < 5 ? 'bg-destructive/10 text-destructive' : 'bg-green-100 text-green-700'}`}>
                            {totalStock} unidades
                          </span>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => {
                          setEditingProduct(product);
                          setIsDialogOpen(true);
                        }}>
                          <Pencil className="h-4 w-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </div>
  );
}
