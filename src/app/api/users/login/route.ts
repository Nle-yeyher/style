import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/mysql'

// POST /api/users/login
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password)
      return NextResponse.json({ ok: false, error: 'Email y contraseña requeridos' }, { status: 400 })

    const [rows]: any = await pool.execute(
      'SELECT id, name, email, role FROM users WHERE email = ? AND password = ?',
      [email, password]
    )

    if (rows.length === 0)
      return NextResponse.json({ ok: false, error: 'Credenciales incorrectas' }, { status: 401 })

    return NextResponse.json({ ok: true, data: rows[0] })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ ok: false, error: 'Error del servidor' }, { status: 500 })
  }
}