from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="ForecastingService", version="1.0.0", description="ForecastingService for ShopSense")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/health")
async def health():
    return {"service": "ForecastingService", "status": "healthy", "model_loaded": False}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8004, reload=True)
