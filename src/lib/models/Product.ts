import pool from '@/lib/mysql';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  sizes: string[];
  suggestions_ids: string[];
  sizeStock: { size: string; stock: number; sold: number }[];
  createdAt?: Date;
}

// ── Helpers internos ──────────────────────────────────────────

async function getSizeStock(productId: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT size, stock, sold FROM product_size_stock WHERE product_id = ?',
    [productId]
  );
  return rows as { size: string; stock: number; sold: number }[];
}

function rowToProduct(row: RowDataPacket, sizeStock: { size: string; stock: number; sold: number }[]): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: parseFloat(row.price),
    imageUrl: row.image_url,
    category: row.category,
    sizes: row.sizes ? JSON.parse(row.sizes) : [],
    suggestions_ids: row.suggestions_ids ? JSON.parse(row.suggestions_ids) : [],
    sizeStock,
    createdAt: row.created_at,
  };
}

// ── API pública (misma interfaz que Mongoose) ─────────────────

const ProductModel = {

  async find(_filter = {}): Promise<{ lean: () => Promise<Product[]> }> {
    return {
      lean: async () => {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM products ORDER BY created_at DESC');
        return Promise.all(
          (rows as RowDataPacket[]).map(async (row) => {
            const sizeStock = await getSizeStock(row.id);
            return rowToProduct(row, sizeStock);
          })
        );
      },
    };
  },

  async findById(id: string | number): Promise<{ lean: () => Promise<Product | null> }> {
    return {
      lean: async () => {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM products WHERE id = ?', [id]);
        if (!rows.length) return null;
        const row = rows[0];
        const sizeStock = await getSizeStock(row.id);
        return rowToProduct(row, sizeStock);
      },
    };
  },

  async insertMany(products: Omit<Product, 'id'>[]) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const created: Product[] = [];

      for (const p of products) {
        const [result] = await conn.execute<ResultSetHeader>(
          `INSERT INTO products (name, description, price, image_url, category, sizes, suggestions_ids)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            p.name, p.description, p.price, p.imageUrl, p.category,
            JSON.stringify(p.sizes || []),
            JSON.stringify(p.suggestions_ids || []),
          ]
        );
        const productId = result.insertId;

        for (const ss of p.sizeStock || []) {
          await conn.execute(
            'INSERT INTO product_size_stock (product_id, size, stock, sold) VALUES (?, ?, ?, ?)',
            [productId, ss.size, ss.stock, ss.sold]
          );
        }

        created.push({ ...p, id: productId });
      }

      await conn.commit();
      return created;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async deleteMany(_filter = {}) {
    await pool.execute('DELETE FROM product_size_stock WHERE 1=1');
    await pool.execute('DELETE FROM products WHERE 1=1');
  },

  async findByIdAndUpdate(id: string | number, data: any) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Actualizar campos del producto (excluir sizeStock)
      const { sizeStock, sizes, suggestions_ids, ...fields } = data;

      const colMap: Record<string, string> = {
        name: 'name', description: 'description', price: 'price',
        imageUrl: 'image_url', category: 'category',
      };

      const setClauses: string[] = [];
      const values: unknown[] = [];

      for (const [key, col] of Object.entries(colMap)) {
        if (fields[key] !== undefined) {
          setClauses.push(`${col} = ?`);
          values.push(fields[key]);
        }
      }
      if (sizes !== undefined) {
        setClauses.push('sizes = ?');
        values.push(JSON.stringify(sizes));
      }
      if (suggestions_ids !== undefined) {
        setClauses.push('suggestions_ids = ?');
        values.push(JSON.stringify(suggestions_ids));
      }

      // Soporte para $inc de sizeStock (usado al procesar compras)
      if (data.$inc) {
        const inc = data.$inc as Record<string, number>;
        const arrayFilters: { 'elem.size': string }[] = data.arrayFilters || [];
        const targetSize = arrayFilters[0]?.['elem.size'];

        if (targetSize) {
          const stockDelta = inc['sizeStock.$[elem].stock'] || 0;
          const soldDelta  = inc['sizeStock.$[elem].sold']  || 0;
          await conn.execute(
            `UPDATE product_size_stock
             SET stock = stock + ?, sold = sold + ?
             WHERE product_id = ? AND size = ?`,
            [stockDelta, soldDelta, id, targetSize]
          );
        }
      } else if (sizeStock) {
        // Reemplazar sizeStock completo
        await conn.execute('DELETE FROM product_size_stock WHERE product_id = ?', [id]);
        for (const ss of sizeStock) {
          await conn.execute(
            'INSERT INTO product_size_stock (product_id, size, stock, sold) VALUES (?, ?, ?, ?)',
            [id, ss.size, ss.stock, ss.sold]
          );
        }
      }

      if (setClauses.length) {
        values.push(id);
        await conn.execute(`UPDATE products SET ${setClauses.join(', ')} WHERE id = ?`, values);
      }

      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async findByIdAndDelete(id: string | number) {
    await pool.execute('DELETE FROM products WHERE id = ?', [id]);
  },

  // Crear un producto individual (equivalente a new ProductModel(data).save())
  async create(data: Omit<Product, 'id'>): Promise<Product> {
    const results = await ProductModel.insertMany([data]);
    return results[0];
  },
};

export default ProductModel;
