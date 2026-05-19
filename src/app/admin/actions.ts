"use server";

import dbConnect from '@/lib/mongodb';
import ProductModel from '@/lib/models/Product';
import { revalidatePath } from 'next/cache';

export async function getProductsAction() {
  await dbConnect();
  const docs = await ProductModel.find({}).lean();
  return docs.map((doc: any) => ({
    id: doc._id.toString(),
    name: doc.name,
    category: doc.category,
    price: doc.price,
    description: doc.description,
    imageUrl: doc.imageUrl,
    sizes: doc.sizes || [],
    sizeStock: doc.sizeStock || [],
    suggestions_ids: doc.suggestions_ids || []
  }));
}

export async function addProductAction(data: any) {
  await dbConnect();
  
  // Si no tiene sizeStock definido, crear uno por defecto
  const productData = {
    ...data,
    sizeStock: data.sizeStock || [
      { size: 'XS', stock: data.stock || 10, sold: 0 },
      { size: 'S', stock: data.stock || 10, sold: 0 },
      { size: 'M', stock: data.stock || 10, sold: 0 },
      { size: 'L', stock: data.stock || 10, sold: 0 },
      { size: 'XL', stock: data.stock || 10, sold: 0 },
      { size: 'XXL', stock: data.stock || 10, sold: 0 },
    ],
    sizes: data.sizes || ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  };
  
  delete productData.stock; // Eliminar el campo stock antiguo
  
  const product = new ProductModel(productData);
  await product.save();
  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true };
}

export async function updateProductAction(id: string, data: any) {
  await dbConnect();
  
  // Si se proporcionó un stock antiguo, convertirlo al nuevo formato
  if (data.stock && !data.sizeStock) {
    data.sizeStock = [
      { size: 'XS', stock: data.stock, sold: 0 },
      { size: 'S', stock: data.stock, sold: 0 },
      { size: 'M', stock: data.stock, sold: 0 },
      { size: 'L', stock: data.stock, sold: 0 },
      { size: 'XL', stock: data.stock, sold: 0 },
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
  await dbConnect();
  await ProductModel.findByIdAndDelete(id);
  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true };
}
