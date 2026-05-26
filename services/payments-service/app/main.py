from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.payments import router

app = FastAPI(title="Payments Service", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"],
                   allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(router)

@app.get("/health")
async def health():
    return {"status": "ok", "service": "payments", "port": 8004}