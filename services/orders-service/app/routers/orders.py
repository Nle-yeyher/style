from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from pydantic import BaseModel
import aiomysql
import time
from app.db import get_pool

router = APIRouter(prefix="/orders", tags=["orders"])

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

@router.get("/")
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

@router.post("/", status_code=201)
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

@router.get("/{order_id}")
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
            await cur.execute(
                "SELECT name, quantity, price, size, product_id FROM order_items WHERE order_id = %s",
                (order_id,)
            )
            items = await cur.fetchall()
    return {**row, "items": list(items), "created_at": row["created_at"].isoformat() if row.get("created_at") else None}