
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useCollection, useUser, useAuth } from '@/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
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

export default function AdminDashboard() {
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const { data: products, loading: productsLoading } = useCollection<Product>(
    db ? collection(db, 'products') : null
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/admin/login');
  };

  const handleSaveProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db) return;

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
      updatedAt: serverTimestamp(),
    };

    const mutationPromise = editingProduct?.id 
      ? updateDoc(doc(db, 'products', editingProduct.id), productData)
      : addDoc(collection(db, 'products'), { ...productData, createdAt: serverTimestamp() });

    mutationPromise
      .then(() => {
        toast({ title: editingProduct?.id ? "Producto actualizado" : "Producto creado" });
        setIsDialogOpen(false);
        setEditingProduct(null);
      })
      .catch((error) => {
        console.error("Error saving product:", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo guardar el producto." });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleDeleteProduct = (id: string) => {
    if (!db || !confirm("¿Estás seguro de eliminar este producto?")) return;
    deleteDoc(doc(db, 'products', id))
      .then(() => {
        toast({ title: "Producto eliminado" });
      })
      .catch((error) => {
        toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el producto." });
      });
  };

  if (authLoading || !user) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Verificando credenciales...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Panel de Control</span>
          </div>
          <h1 className="text-3xl font-bold font-headline">Hola, {user.displayName?.split(' ')[0]}</h1>
          <p className="text-muted-foreground">Gestiona el inventario global de la tienda.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" /> Cerrar Sesión
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
                    <Label htmlFor="price">Precio ($)</Label>
                    <Input id="price" name="price" type="number" step="0.01" defaultValue={editingProduct?.price} required />
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
                <div className="text-2xl font-bold">{products?.length || 0}</div>
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Bajo Stock (&lt; 5)</CardTitle>
                <RefreshCw className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {products?.filter(p => p.stock < 5).length || 0}
                </div>
              </CardContent>
            </Card>
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
                {products?.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="relative h-12 w-10 overflow-hidden rounded border">
                        <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold">{product.name}</div>
                      <div className="text-xs text-muted-foreground uppercase">{product.category}</div>
                    </TableCell>
                    <TableCell className="font-mono font-bold">${product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`rounded-full px-2 py-1 text-xs font-bold ${product.stock < 5 ? 'bg-destructive/10 text-destructive' : 'bg-green-100 text-green-700'}`}>
                        {product.stock} unidades
                      </span>
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
