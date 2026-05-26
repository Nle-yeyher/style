from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from pydantic import BaseModel
import aiomysql
from app.db import get_pool

router = APIRouter(prefix="/users", tags=["users"])

class CreateUserRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "customer"

class UpdateUserRequest(BaseModel):
    id: int
    name: str

class ChangePasswordRequest(BaseModel):
    id: int
    currentPassword: str
    newPassword: str

@router.get("/")
async def get_users(user_id: Optional[int] = Query(None)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            if user_id:
                await cur.execute(
                    "SELECT id, name, email, role, created_at FROM users WHERE id = %s",
                    (user_id,)
                )
                row = await cur.fetchone()
                if not row:
                    raise HTTPException(status_code=404, detail="Usuario no encontrado")
                return {"ok": True, "data": row}
            await cur.execute(
                "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"
            )
            rows = await cur.fetchall()
    return {"ok": True, "data": list(rows)}

@router.post("/", status_code=201)
async def create_user(body: CreateUserRequest):
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT id FROM users WHERE email = %s", (body.email,))
            if await cur.fetchone():
                raise HTTPException(status_code=409, detail="El email ya está registrado")
            await cur.execute(
                "INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, %s)",
                (body.name, body.email, body.password, body.role)
            )
            user_id = cur.lastrowid
    return {"ok": True, "data": {"id": user_id, "name": body.name, "email": body.email, "role": body.role}}

@router.put("/")
async def update_user(body: UpdateUserRequest):
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("UPDATE users SET name = %s WHERE id = %s", (body.name, body.id))
            if cur.rowcount == 0:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")
            await cur.execute("SELECT id, name, email, role FROM users WHERE id = %s", (body.id,))
            user = await cur.fetchone()
    return {"ok": True, "user": user}

@router.patch("/")
async def change_password(body: ChangePasswordRequest):
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute(
                "SELECT id FROM users WHERE id = %s AND password = %s",
                (body.id, body.currentPassword)
            )
            if not await cur.fetchone():
                raise HTTPException(status_code=401, detail="Contraseña actual incorrecta")
            await cur.execute(
                "UPDATE users SET password = %s WHERE id = %s",
                (body.newPassword, body.id)
            )
    return {"ok": True}