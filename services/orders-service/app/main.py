from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import orders, payments

app = FastAPI(
    title="Orders & Payments Service",
    description="Microservicio de órdenes y pagos para el proyecto Style",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — permite que el frontend Next.js hable con este servicio
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # URL del frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(orders.router)
app.include_router(payments.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "orders-payments"}
