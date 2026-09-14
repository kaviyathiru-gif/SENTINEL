from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

app = FastAPI(title="Sentinel Metric Ingestion")

class MetricPayload(BaseModel):
    timestamp: str
    domain_url: str
    source_ip: str
    metrics: Dict[str, Any]

@app.post("/api/v1/telemetry")
async def ingest_telemetry(payload: MetricPayload):
    try:
        # 1. Validate payload structure (handled automatically by Pydantic)
        # 2. Process data / trigger alerts if anomaly_severity_score > threshold
        
        print(f"Received telemetry for: {payload.domain_url}")
        
        # TODO: Push to Firebase / Database for Power BI consumption
        
        return {
            "status": "success", 
            "message": "Telemetry received", 
            "domain": payload.domain_url
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
