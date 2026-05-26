import { NextRequest, NextResponse } from 'next/server'

const SVC = process.env.PRODUCTS_SERVICE_URL || 'http://localhost:8002'

export async function GET(req: NextRequest) {
  try {
    const category = new URL(req.url).searchParams.get('category')
    const qs = category ? `?category=${category}` : ''
    const res = await fetch(`${SVC}/products/${qs}`, { signal: AbortSignal.timeout(8000) })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ ok: false, error: 'Servicio de productos no disponible' }, { status: 503 })
  }
}