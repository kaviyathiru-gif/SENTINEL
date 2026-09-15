import os
import time
import torch
import torch.nn as nn
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
import firebase_admin
from firebase_admin import credentials, firestore

# ==========================================
# 1. Initialization & Configuration
# ==========================================

app = FastAPI(
    title="Sentinel Security Engine API",
    description="Backend API for Sentinel ML-driven Threat Analytics and Escalation",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Firebase Firestore
# Ensure 'serviceAccountKey.json' is in the root directory
if not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

# ==========================================
# 2. PyTorch Machine Learning Model Setup
# ==========================================

class ThreatDetectionNN(nn.Module):
    """
    Simple Neural Network evaluating threat levels based on incoming parameters:
    [request_rate, error_rate, payload_size]
    """
    def __init__(self):
        super(ThreatDetectionNN, self).__init__()
        self.fc1 = nn.Linear(3, 8)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(8, 1)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        x = self.relu(self.fc1(x))
        x = self.sigmoid(self.fc2(x))
        return x

# Instantiate model & set to evaluation mode
model = ThreatDetectionNN()
model.eval()

# ==========================================
# 3. Pydantic Schemas
# ==========================================

class ProtectSiteRequest(BaseModel):
    url: HttpUrl

class ThreatAnalyzeRequest(BaseModel):
    site_url: str
    request_rate: float
    error_rate: float
    payload_size: float

class EscalationConfig(BaseModel):
    primary_admin_phone: str
    secondary_admin_phone: str
    company_oncall_phone: str

# ==========================================
# 4. Helper Functions / Background Tasks
# ==========================================

def trigger_escalation_protocol(site_url: str, threat_score: float):
    """
    Simulates automated emergency call routing (Twilio / Call API)
    Primary Admin -> Secondary Admin -> Company On-call
    """
    print(f"[ESCALATION TRIGGERED] High severity threat ({threat_score:.2f}) detected on {site_url}")
    # Integration logic for telephony API (e.g., Twilio) goes here
    # 1. Attempt Call Primary Admin
    # 2. If no response -> Call Secondary
    # 3. If no response -> Route to 24/7 Company On-call

# ==========================================
# 5. API Endpoints
# ==========================================

@app.post("/api/v1/protect-site")
async def protect_site(payload: ProtectSiteRequest):
    """Registers a website for Sentinel live protection (Max 5 active)."""
    sites_ref = db.collection("protected_sites")
    docs = list(sites_ref.stream())
    
    if len(docs) >= 5:
        raise HTTPException(status_code=400, detail="Maximum 5 websites can be protected simultaneously.")

    doc_ref = sites_ref.add({
        "url": str(payload.url),
        "status": "Active",
        "added_at": firestore.SERVER_TIMESTAMP
    })

    return {"status": "success", "message": f"Site {payload.url} is now protected.", "doc_id": doc_ref[1].id}


@app.post("/api/v1/analyze-threat")
async def analyze_threat(payload: ThreatAnalyzeRequest, background_tasks: BackgroundTasks):
    """
    Runs real-time inference via PyTorch on traffic features.
    Saves logs to Firestore and triggers escalation if threat > threshold.
    """
    try:
        # Prepare tensor input
        input_data = torch.tensor(
            [[payload.request_rate, payload.error_rate, payload.payload_size]], 
            dtype=torch.float32
        )

        # PyTorch Inference
        with torch.no_grad():
            threat_score = model(input_data).item()

        is_threat = threat_score > 0.75

        # Record Log Entry in Firestore
        log_data = {
            "site_url": payload.site_url,
            "threat_score": float(threat_score),
            "is_threat": is_threat,
            "request_rate": payload.request_rate,
            "error_rate": payload.error_rate,
            "timestamp": firestore.SERVER_TIMESTAMP
        }
        
        doc_ref = db.collection("threat_logs").add(log_data)

        # Trigger automated phone escalation background task if severe threat
        if is_threat:
            background_tasks.add_task(trigger_escalation_protocol, payload.site_url, threat_score)

        return {
            "status": "success",
            "threat_score": threat_score,
            "action_taken": "Escalation Triggered" if is_threat else "Monitored",
            "log_id": doc_ref[1].id
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/logs")
async def get_logs(limit: int = 20):
    """Retrieves recent logs for frontend dashboard analysis."""
    logs_ref = db.collection("threat_logs").order_by("timestamp", direction=firestore.Query.DESCENDING).limit(limit)
    logs = [doc.to_dict() for doc in logs_ref.stream()]
    return {"status": "success", "data": logs}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
