from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime

from app.firebase_config import push_metric_to_firebase
from app.vision_engine import analyze_dom_snapshot

app = FastAPI(title="Sentinel Threat Analytics API", version="1.0.0")

class MetricPayload(BaseModel):
    timestamp: str
    domain_url: str
    source_ip: str
    metrics: Dict[str, Any]

@app.post("/api/v1/telemetry")
async def ingest_telemetry(payload: MetricPayload):
    """Ingests real-time 13 metrics and streams to Firebase."""
    try:
        data = payload.dict()
        push_metric_to_firebase(payload.domain_url, data)
        return {"status": "success", "message": "Telemetry synced", "domain": payload.domain_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/analyze-snapshot")
async def analyze_snapshot(
    domain_url: str = Form(...),
    file: UploadFile = File(...)
):
    """Analyzes uploaded web DOM screenshot via CV engine and pushes results."""
    try:
        image_bytes = await file.read()
        vision_results = analyze_dom_snapshot(image_bytes)
        
        payload = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "domain_url": domain_url,
            "vision_analysis": vision_results
        }
        
        push_metric_to_firebase(domain_url, payload)
        return {"status": "success", "domain": domain_url, "vision_results": vision_results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
