import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/mysql'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const [rows]: any = await pool.execute(
      `SELECT p.*,
        GROUP_CONCAT(
          CONCAT(pss.size, ':', pss.stock, ':', pss.sold)
          ORDER BY pss.size
        ) as stock_raw
       FROM products p
       LEFT JOIN product_size_stock pss ON p.id = pss.product_id
       WHERE p.id = ?
       GROUP BY p.id`,
      [id]
    )

    if (!rows || rows.length === 0)
      return NextResponse.json({ ok: false, error: 'Producto no encontrado' }, { status: 404 })

    const row = rows[0]
    const data = {
      ...row,
      stock_info: row.stock_raw
        ? row.stock_raw.split(',').map((entry: string) => {
            const [size, stock, sold] = entry.split(':')
            return { size, stock: Number(stock), sold: Number(sold) }
          })
        : [],
      stock_raw: undefined,
    }

    return NextResponse.json({ ok: true, data })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ ok: false, error: 'Error del servidor' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { name, description, price, image_url, category } = await req.json()

    await pool.execute(
      'UPDATE products SET name=?, description=?, price=?, image_url=?, category=? WHERE id=?',
      [name, description, price, image_url, category, id]
    )

    return NextResponse.json({ ok: true, message: 'Producto actualizado' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ ok: false, error: 'Error al actualizar' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await pool.execute('DELETE FROM products WHERE id=?', [id])
    return NextResponse.json({ ok: true, message: 'Producto eliminado' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ ok: false, error: 'Error al eliminar' }, { status: 500 })
  }
}