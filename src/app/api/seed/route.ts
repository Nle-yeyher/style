import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ProductModel from '@/lib/models/Product';

const DUMMY_PRODUCTS = [
  {
    name: 'Blazer Entallado Midnight',
    description: 'Un blazer sofisticado para cualquier ocasión formal o casual elegante. Material premium y costuras hechas a mano.',
    price: 120.00,
    imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&auto=format&fit=crop&q=60',
    category: 'Chaquetas',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    sizeStock: [
      { size: 'XS', stock: 5, sold: 0 },
      { size: 'S', stock: 8, sold: 0 },
      { size: 'M', stock: 15, sold: 0 },
      { size: 'L', stock: 12, sold: 0 },
      { size: 'XL', stock: 10, sold: 0 },
      { size: 'XXL', stock: 5, sold: 0 },
    ],
  },
  {
    name: 'Camisa Blanca Premium',
    description: 'Una camisa clásica de algodón orgánico, un componente esencial en cualquier armario minimalista y sofisticado.',
    price: 45.00,
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e32f85e23?w=500&auto=format&fit=crop&q=60',
    category: 'Camisas',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    sizeStock: [
      { size: 'XS', stock: 20, sold: 0 },
      { size: 'S', stock: 25, sold: 0 },
      { size: 'M', stock: 30, sold: 0 },
      { size: 'L', stock: 25, sold: 0 },
      { size: 'XL', stock: 20, sold: 0 },
      { size: 'XXL', stock: 15, sold: 0 },
    ],
  },
  {
    name: 'Pantalón Chino Color Arena',
    description: 'Pantalones cómodos y versátiles con un corte ligeramente ajustado. Ideal para el día a día en la oficina.',
    price: 55.00,
    imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop&q=60',
    category: 'Pantalones',
    sizes: ['28', '30', '32', '34', '36', '38'],
    sizeStock: [
      { size: '28', stock: 8, sold: 0 },
      { size: '30', stock: 12, sold: 0 },
      { size: '32', stock: 18, sold: 0 },
      { size: '34', stock: 15, sold: 0 },
      { size: '36', stock: 12, sold: 0 },
      { size: '38', stock: 8, sold: 0 },
    ],
  },
  {
    name: 'Abrigo de Lana Minimalista',
    description: 'El complemento perfecto para los días fríos con un diseño de líneas completamente limpias.',
    price: 180.00,
    imageUrl: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=500&auto=format&fit=crop&q=60',
    category: 'Abrigos',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    sizeStock: [
      { size: 'XS', stock: 3, sold: 0 },
      { size: 'S', stock: 4, sold: 0 },
      { size: 'M', stock: 5, sold: 0 },
      { size: 'L', stock: 5, sold: 0 },
      { size: 'XL', stock: 4, sold: 0 },
      { size: 'XXL', stock: 3, sold: 0 },
    ],
  }
];

export async function GET() {
  try {
    await dbConnect();

    // Eliminamos los existentes para no acumular basura
    await ProductModel.deleteMany({});

    // Insertamos los cuatro productos por defecto
    const created = await ProductModel.insertMany(DUMMY_PRODUCTS);

    return NextResponse.json({
      success: true,
      message: 'Base de datos sembrada (seeding) exitosamente',
      insertedCount: created.length
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Falló el seed: ' + error.message
    }, { status: 500 });
  }
}
