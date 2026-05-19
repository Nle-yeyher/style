'use server';

import dbConnect from '@/lib/mysql';
import UserModel from '@/lib/models/User';
import OrderModel from '@/lib/models/Order';
import { revalidatePath } from 'next/cache';

export async function registerUserAction(data: { name: string; email: string; password: string }) {
  await dbConnect();
  
  const existing = await UserModel.findOne({ email: data.email.toLowerCase() });
  if (existing) {
    return { success: false, error: 'El email ya está registrado' };
  }

  try {
    const user = new UserModel({
      name: data.name,
      email: data.email.toLowerCase(),
      password: data.password,
    });
    await user.save();
    return { success: true, user: { id: user._id.toString(), name: user.name, email: user.email } };
  } catch (error) {
    console.error('Error registering user:', error);
    return { success: false, error: 'Error al registrar usuario' };
  }
}

export async function loginUserAction(email: string, password: string) {
  await dbConnect();

  try {
    const user = await UserModel.findOne({ email: email.toLowerCase() }).lean();
    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    if (user.password !== password) {
      return { success: false, error: 'Contraseña incorrecta' };
    }

    return { success: true, user: { id: user._id.toString(), name: user.name, email: user.email } };
  } catch (error) {
    console.error('Error logging in:', error);
    return { success: false, error: 'Error al iniciar sesión' };
  }
}

export async function getUserAction(userId: string) {
  await dbConnect();

  try {
    const user = await UserModel.findById(userId).lean();
    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    return { success: true, user: { id: user._id.toString(), name: user.name, email: user.email } };
  } catch (error) {
    console.error('Error getting user:', error);
    return { success: false, error: 'Error al obtener usuario' };
  }
}

export async function changePasswordAction(userId: string, currentPassword: string, newPassword: string) {
  await dbConnect();

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    if (user.password !== currentPassword) {
      return { success: false, error: 'Contraseña actual incorrecta' };
    }

    user.password = newPassword;
    user.updatedAt = new Date();
    await user.save();
    
    revalidatePath('/profile');
    return { success: true };
  } catch (error) {
    console.error('Error changing password:', error);
    return { success: false, error: 'Error al cambiar contraseña' };
  }
}

export async function updateUserAction(userId: string, data: { name: string }) {
  await dbConnect();

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    user.name = data.name;
    user.updatedAt = new Date();
    await user.save();

    revalidatePath('/profile');
    return {
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: 'Error al actualizar usuario' };
  }
}

export async function getOrdersAction(userId: string) {
  await dbConnect();

  try {
    const orders = await OrderModel.find({ userId }).lean().sort({ createdAt: -1 });
    return {
      success: true,
      orders: orders.map((order: any) => ({
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        items: order.items.map((item: any) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
        })),
        total: order.total,
        status: order.status,
        date: order.createdAt,
      })),
    };
  } catch (error) {
    console.error('Error getting orders:', error);
    return { success: false, error: 'Error al obtener pedidos' };
  }
}

export async function saveOrderAction(userId: string, orderData: any) {
  await dbConnect();

  try {
    const order = new OrderModel({
      userId,
      orderNumber: orderData.orderNumber,
      items: orderData.items,
      total: orderData.total,
      status: orderData.status || 'completed',
    });
    await order.save();
    return { success: true, order: { id: order._id.toString() } };
  } catch (error) {
    console.error('Error saving order:', error);
    return { success: false, error: 'Error al guardar pedido' };
  }
}

export async function updateProductStockAction(items: Array<{ productId: string; size?: string; quantity: number }>) {
  await dbConnect();

  try {
    for (const item of items) {
      if (!item.size) continue;

      // Actualizar stock y sold para cada talla
      const result = await ProductModel.findByIdAndUpdate(
        item.productId,
        {
          $inc: {
            'sizeStock.$[elem].stock': -item.quantity,
            'sizeStock.$[elem].sold': item.quantity,
          }
        },
        {
          arrayFilters: [{ 'elem.size': item.size }],
          new: true
        }
      );

      if (!result) {
        return { success: false, error: `Producto ${item.productId} no encontrado` };
      }
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error updating stock:', error);
    return { success: false, error: 'Error al actualizar stock' };
  }
}
