from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel
from typing import Any, Optional, List
import aiomysql
import asyncio
import time
import random
import string
import os

# ── DB ──────────────────────────────────────────────────────────────────────
_pool = None

async def get_pool():
    global _pool
    if _pool is None:
        _pool = await aiomysql.create_pool(
            host=os.getenv("MYSQL_HOST", "localhost"),
            port=int(os.getenv("MYSQL_PORT", "3306")),
            user=os.getenv("MYSQL_USER", "root"),
            password=os.getenv("MYSQL_PASSWORD", ""),
            db=os.getenv("MYSQL_DATABASE", "style_db"),
            autocommit=True,
            minsize=1,
            maxsize=5,
        )
    return _pool

async def close_pool():
    global _pool
    if _pool:
        _pool.close()
        await _pool.wait_closed()
        _pool = None

# ── APP ──────────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    await get_pool()
    yield
    await close_pool()

app = FastAPI(title="Style API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok", "service": "style-api"}

# ── PRODUCTS ─────────────────────────────────────────────────────────────────
@app.get("/products")
async def list_products(category: Optional[str] = Query(None)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            query = """
                SELECT p.*,
                    GROUP_CONCAT(
                        CONCAT(pss.size, ':', pss.stock, ':', pss.sold)
                        ORDER BY pss.size
                    ) as stock_raw
                FROM products p
                LEFT JOIN product_size_stock pss ON p.id = pss.product_id
            """
            params = []
            if category:
                query += " WHERE p.category = %s"
                params.append(category)
            query += " GROUP BY p.id ORDER BY p.id"
            await cur.execute(query, params)
            rows = await cur.fetchall()

    data = []
    for row in rows:
        stock_info = []
        if row["stock_raw"]:
            for entry in row["stock_raw"].split(","):
                parts = entry.split(":")
                if len(parts) == 3:
                    stock_info.append({"size": parts[0], "stock": int(parts[1]), "sold": int(parts[2])})
        item = {k: v for k, v in row.items() if k != "stock_raw"}
        item["stock_info"] = stock_info
        data.append(item)
    return {"ok": True, "data": data}

# ── USERS ─────────────────────────────────────────────────────────────────────
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

@app.get("/users")
async def get_users(user_id: Optional[int] = Query(None)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            if user_id:
                await cur.execute("SELECT id, name, email, role, created_at FROM users WHERE id = %s", (user_id,))
                row = await cur.fetchone()
                if not row:
                    raise HTTPException(status_code=404, detail="Usuario no encontrado")
                return {"ok": True, "data": row}
            await cur.execute("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC")
            rows = await cur.fetchall()
    return {"ok": True, "data": list(rows)}

@app.post("/users", status_code=201)
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

@app.put("/users")
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

@app.patch("/users")
async def change_password(body: ChangePasswordRequest):
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT id FROM users WHERE id = %s AND password = %s", (body.id, body.currentPassword))
            if not await cur.fetchone():
                raise HTTPException(status_code=401, detail="Contraseña actual incorrecta")
            await cur.execute("UPDATE users SET password = %s WHERE id = %s", (body.newPassword, body.id))
    return {"ok": True}

# ── ORDERS ────────────────────────────────────────────────────────────────────
class OrderItem(BaseModel):
    product_id: Optional[int] = None
    name: str
    price: float
    quantity: int
    size: Optional[str] = None

class CreateOrderRequest(BaseModel):
    user_id: int
    items: List[OrderItem]
    total: float

@app.get("/orders")
async def list_orders(user_id: Optional[int] = Query(None)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            query = """
                SELECT o.id, o.user_id, o.order_number, o.total, o.status, o.created_at,
                    u.name as user_name, u.email as user_email,
                    GROUP_CONCAT(
                        CONCAT(oi.name,'||',oi.quantity,'||',oi.price,'||',IFNULL(oi.size,''),'||',IFNULL(oi.product_id,''))
                        ORDER BY oi.id SEPARATOR ';;'
                    ) as items_raw
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
                LEFT JOIN order_items oi ON o.id = oi.order_id
            """
            params = []
            if user_id:
                query += " WHERE o.user_id = %s"
                params.append(user_id)
            query += " GROUP BY o.id ORDER BY o.created_at DESC"
            await cur.execute(query, params)
            rows = await cur.fetchall()

    result = []
    for row in rows:
        items = []
        if row["items_raw"]:
            for entry in row["items_raw"].split(";;"):
                parts = entry.split("||")
                items.append({
                    "name": parts[0],
                    "quantity": int(parts[1]),
                    "price": float(parts[2]),
                    "size": parts[3] if parts[3] else None,
                    "product_id": int(parts[4]) if len(parts) > 4 and parts[4] else None,
                })
        result.append({
            "id": row["id"],
            "user_id": row["user_id"],
            "order_number": row["order_number"],
            "total": float(row["total"]),
            "status": row["status"],
            "created_at": row["created_at"].isoformat() if row["created_at"] else None,
            "user_name": row.get("user_name"),
            "user_email": row.get("user_email"),
            "items": items,
        })
    return result

@app.post("/orders", status_code=201)
async def create_order(body: CreateOrderRequest):
    pool = await get_pool()
    order_number = f"ORD-{int(time.time() * 1000)}"
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "INSERT INTO orders (user_id, order_number, total, status) VALUES (%s, %s, %s, %s)",
                (body.user_id, order_number, body.total, "completed")
            )
            order_id = cur.lastrowid
            for item in body.items:
                await cur.execute(
                    "INSERT INTO order_items (order_id, product_id, name, price, quantity, size) VALUES (%s, %s, %s, %s, %s, %s)",
                    (order_id, item.product_id, item.name, item.price, item.quantity, item.size or "")
                )
                if item.product_id and item.size:
                    await cur.execute(
                        "UPDATE product_size_stock SET stock = stock - %s, sold = sold + %s WHERE product_id = %s AND size = %s",
                        (item.quantity, item.quantity, item.product_id, item.size)
                    )
    return {"ok": True, "data": {"id": order_id, "order_number": order_number, "total": body.total}}

@app.get("/orders/{order_id}")
async def get_order(order_id: int):
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute(
                "SELECT o.*, u.name as user_name, u.email as user_email FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = %s",
                (order_id,)
            )
            row = await cur.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Orden no encontrada")
            await cur.execute("SELECT name, quantity, price, size, product_id FROM order_items WHERE order_id = %s", (order_id,))
            items = await cur.fetchall()
    return {**row, "items": list(items), "created_at": row["created_at"].isoformat() if row.get("created_at") else None}

# ── PAYMENTS ──────────────────────────────────────────────────────────────────
class PaymentRequest(BaseModel):
    paymentMethod: str
    amount: float
    details: Optional[Any] = None

@app.post("/payments/pay")
async def process_payment(body: PaymentRequest):
    await asyncio.sleep(1)
    transaction_id = f"txn_{int(time.time())}_{''.join(random.choices(string.ascii_lowercase + string.digits, k=9))}"
    return {
        "success": True,
        "message": "Pago procesado exitosamente",
        "transactionId": transaction_id,
        "amount": body.amount,
        "paymentMethod": body.paymentMethod,
        "status": "completed",
    }
