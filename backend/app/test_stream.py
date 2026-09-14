import requests
import time
import random
from datetime import datetime

API_URL = "http://127.0.0.1:8000/api/v1/telemetry"

domains = ["https://example.com", "https://mysite.org", "https://secure-app.io"]

while True:
    payload = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "domain_url": random.choice(domains),
        "source_ip": f"192.168.1.{random.randint(1, 255)}",
        "metrics": {
            "traffic_volume_req_per_sec": random.randint(100, 1000),
            "latency_ms": round(random.uniform(20.0, 300.0), 2),
            "anomaly_severity_score": round(random.uniform(0.0, 1.0), 2),
            "cv_confidence_index": round(random.uniform(0.7, 0.99), 2),
            "bandwidth_usage_mbps": round(random.uniform(5.0, 50.0), 2),
            "http_error_rate_percent": round(random.uniform(0.0, 5.0), 2),
            "unusual_geo_flag": random.choice([True, False]),
            "packet_loss_rate_percent": round(random.uniform(0.0, 1.0), 2),
            "ssl_tls_status": "VALID",
            "suspicious_script_count": random.randint(0, 3),
            "dns_query_volume": random.randint(500, 2000),
            "concurrent_active_sessions": random.randint(50, 500),
            "threat_attack_vector": random.choice(["NONE", "NONE", "NONE", "XSS", "DDoS"])
        }
    }
    
    try:
        res = requests.post(API_URL, json=payload)
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Sent telemetry -> Status: {res.status_code}")
    except Exception as e:
        print(f"Failed to connect to FastAPI server: {e}")
        
    time.sleep(2)
