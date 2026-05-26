import { NextRequest, NextResponse } from 'next/server'

const SVC = process.env.USERS_SERVICE_URL || 'http://localhost:8003'

export async function GET(req: NextRequest) {
  try {
    const user_id = new URL(req.url).searchParams.get('user_id')
    const qs = user_id ? `?user_id=${user_id}` : ''
    const res = await fetch(`${SVC}/users/${qs}`, { signal: AbortSignal.timeout(8000) })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ ok: false, error: 'Servicio de usuarios no disponible' }, { status: 503 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const res = await fetch(`${SVC}/users/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ ok: false, error: 'Servicio de usuarios no disponible' }, { status: 503 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const res = await fetch(`${SVC}/users/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ ok: false, error: 'Servicio de usuarios no disponible' }, { status: 503 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const res = await fetch(`${SVC}/users/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ ok: false, error: 'Servicio de usuarios no disponible' }, { status: 503 })
  }
}