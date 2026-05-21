import ProductModel from '@/lib/models/Product';
import { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function productMatchesGender(product: Product, gender: 'hombre' | 'mujer') {
  const text = `${product.name} ${product.description} ${product.category}`.toLowerCase();

  const filters = {
    hombre: {
      keywords: ['hombre', 'caballero', 'blazer', 'camisa', 'pantalón', 'pantalones', 'chino', 'abrigo', 'saco', 'jeans', 'americana'],
      categories: ['chaquetas', 'camisas', 'pantalones', 'abrigos', 'trajes', 'sacos'],
    },
    mujer: {
      keywords: ['mujer', 'dama', 'vestido', 'blusa', 'falda', 'top', 'short', 'legging', 'bolso', 'sandalia', 'tacones', 'jeans', 'abrigo'],
      categories: ['vestidos', 'blusas', 'faldas', 'tops', 'accesorios', 'jeans', 'shorts'],
    },
  };

  const rule = filters[gender];
  const category = product.category.toLowerCase();
  return (
    rule.categories.some((cat) => category.includes(cat)) ||
    rule.keywords.some((keyword) => text.includes(keyword))
  );
}

export default async function WomenCollectionPage() {
  const allProducts: Product[] = await (await ProductModel.find({})).lean() as any[];
  const filteredProducts = allProducts.filter((product) => productMatchesGender(product, 'mujer'));

  return (
    <div className="space-y-12 pb-20">
      <div className="space-y-6">
        <Button
          variant="outline"
          asChild
          className="rounded-full gap-2 w-fit transition-all hover:bg-primary hover:text-primary-foreground group"
        >
          <Link href="/collections">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Volver a Colecciones
          </Link>
        </Button>

        <div className="border-b pb-8">
          <h1 className="text-4xl font-bold font-headline">Colección Mujer</h1>
          <p className="mt-2 text-muted-foreground">
            Descubre prendas y accesorios pensados para mujer, con estilo contemporáneo y detalles refinados.
          </p>
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-muted p-12 text-center">
          <h2 className="text-2xl font-bold">No hay productos específicos para mujer aún</h2>
          <p className="mt-4 text-muted-foreground">
            Estamos trabajando para ampliar nuestra colección de mujer. Mientras tanto, explora el catálogo completo.
          </p>
          <Link href="/collections" className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary/90">
            Volver a Colecciones
          </Link>
        </div>
      )}
    </div>
  );
}
