"use server";

import ProductModel from '@/lib/models/Product';
import { revalidatePath } from 'next/cache';

export async function getProductsAction() {
  const docs = await (await ProductModel.find({})).lean();
  return docs.map((doc) => ({
    id: doc.id,
    name: doc.name,
    category: doc.category,
    price: doc.price,
    description: doc.description,
    imageUrl: doc.imageUrl,
    sizes: doc.sizes || [],
    sizeStock: doc.sizeStock || [],
    suggestions_ids: doc.suggestions_ids || [],
  }));
}

export async function addProductAction(data: any) {
  const productData = {
    ...data,
    sizeStock: data.sizeStock || [
      { size: 'XS',  stock: data.stock || 10, sold: 0 },
      { size: 'S',   stock: data.stock || 10, sold: 0 },
      { size: 'M',   stock: data.stock || 10, sold: 0 },
      { size: 'L',   stock: data.stock || 10, sold: 0 },
      { size: 'XL',  stock: data.stock || 10, sold: 0 },
      { size: 'XXL', stock: data.stock || 10, sold: 0 },
    ],
    sizes: data.sizes || ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    suggestions_ids: data.suggestions_ids || [],
  };

  delete productData.stock;

  await ProductModel.create(productData);
  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true };
}

export async function updateProductAction(id: string, data: any) {
  if (data.stock && !data.sizeStock) {
    data.sizeStock = [
      { size: 'XS',  stock: data.stock, sold: 0 },
      { size: 'S',   stock: data.stock, sold: 0 },
      { size: 'M',   stock: data.stock, sold: 0 },
      { size: 'L',   stock: data.stock, sold: 0 },
      { size: 'XL',  stock: data.stock, sold: 0 },
      { size: 'XXL', stock: data.stock, sold: 0 },
    ];
    delete data.stock;
  }

  if (data.sizes === undefined) {
    data.sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  }

  await ProductModel.findByIdAndUpdate(id, data);
  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true };
}

export async function deleteProductAction(id: string) {
  await ProductModel.findByIdAndDelete(id);
  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true };
}
