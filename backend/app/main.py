from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
from app.firebase_config import push_metric_to_firebase  # Import the function

app = FastAPI(title="Sentinel Metric Ingestion")

class MetricPayload(BaseModel):
    timestamp: str
    domain_url: str
    source_ip: str
    metrics: Dict[str, Any]

@app.post("/api/v1/telemetry")
async def ingest_telemetry(payload: MetricPayload):
    try:
        data = payload.dict()
        
        # Sync directly with Firebase Realtime Database
        push_metric_to_firebase(payload.domain_url, data)
        
        return {
            "status": "success", 
            "message": "Telemetry received and synced to Firebase", 
            "domain": payload.domain_url
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
