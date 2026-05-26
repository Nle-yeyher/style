from fastapi import APIRouter, Query
from typing import Optional
import aiomysql
from app.db import get_pool

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/")
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
                    stock_info.append({
                        "size": parts[0],
                        "stock": int(parts[1]),
                        "sold": int(parts[2])
                    })
        item = {k: v for k, v in row.items() if k != "stock_raw"}
        item["stock_info"] = stock_info
        data.append(item)

    return {"ok": True, "data": data}