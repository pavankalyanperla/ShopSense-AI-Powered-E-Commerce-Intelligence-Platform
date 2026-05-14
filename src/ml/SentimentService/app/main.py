from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="SentimentService", version="1.0.0", description="SentimentService for ShopSense")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/health")
async def health():
    return {"service": "SentimentService", "status": "healthy", "model_loaded": False}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8003, reload=True)
