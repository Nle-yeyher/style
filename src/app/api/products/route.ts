import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/mysql'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')

    let query = `
      SELECT p.*,
        GROUP_CONCAT(
          CONCAT(pss.size, ':', pss.stock, ':', pss.sold)
          ORDER BY pss.size
        ) as stock_raw
      FROM products p
      LEFT JOIN product_size_stock pss ON p.id = pss.product_id
    `
    const params: string[] = []

    if (category) {
      query += ' WHERE p.category = ?'
      params.push(category)
    }

    query += ' GROUP BY p.id ORDER BY p.id'

    const [rows]: any = await pool.execute(query, params)

    // Convertir stock_raw "XS:10:0,S:8:0" en array de objetos
    const data = rows.map((row: any) => ({
      ...row,
      stock_info: row.stock_raw
        ? row.stock_raw.split(',').map((entry: string) => {
            const [size, stock, sold] = entry.split(':')
            return { size, stock: Number(stock), sold: Number(sold) }
          })
        : [],
      stock_raw: undefined,
    }))

    return NextResponse.json({ ok: true, data })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ ok: false, error: 'Error al obtener productos' }, { status: 500 })
  }
}