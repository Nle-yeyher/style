import { NextResponse } from 'next/server';
import ProductModel from '@/lib/models/Product';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await (await ProductModel.findById(id)).lean();

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: product.id,
      name: product.name,
      sizeStock: product.sizeStock || [],
      sizes: product.sizes || [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching product' },
      { status: 500 }
    );
  }
}
