from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="ChurnService", version="1.0.0", description="ChurnService for ShopSense")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/health")
async def health():
    return {"service": "ChurnService", "status": "healthy", "model_loaded": False}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8005, reload=True)
