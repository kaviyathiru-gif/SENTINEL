"""
Sentinel MLDL NIDS - Backend API Server
Built with standard Python HTTP server (zero external dependency requirements for instant execution)
and optionally extensible to FastAPI / Flask.
"""

import sys
import os
import json
import time
import random
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# Add parent directory to sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

from model.inference import SentinelInferenceEngine
from backend.geotagging import GeoTaggingService
from backend.firestore_service import FirestoreService
from backend.alert_service import AlertNotificationService

# Initialize Sentinel Services
inference_engine = SentinelInferenceEngine(
    checkpoint_path=os.path.join(BASE_DIR, "model", "checkpoints", "sentinel_ids_best.pth"),
    preprocessor_path=os.path.join(BASE_DIR, "model", "checkpoints", "preprocessor_params.json")
)
geotag_service = GeoTaggingService()
firestore_service = FirestoreService()
alert_service = AlertNotificationService(admin_email="admin.security@sentinel-soc.internal")

ATTACK_SCENARIOS = [
    {
        "type": "Normal Traffic",
        "src_ip": "198.51.100.42",
        "dst_ip": "10.0.0.15",
        "dst_port": 443,
        "flow": {
            "flow_duration_ms": 12400, "total_fwd_packets": 24, "total_bwd_packets": 28,
            "total_fwd_bytes": 14200, "total_bwd_bytes": 35600, "packet_length_mean": 620,
            "packet_length_std": 120, "syn_flag_count": 1, "fin_flag_count": 1, "rst_flag_count": 0,
            "psh_flag_count": 4, "ack_flag_count": 51, "urg_flag_count": 0, "flow_bytes_per_sec": 4016,
            "flow_packets_per_sec": 4.19, "dst_port_entropy": 0.12, "failed_logins": 0,
            "down_up_ratio": 2.5, "avg_packet_size": 957, "fwd_header_length": 480,
            "bwd_header_length": 560, "active_mean_ms": 320, "idle_mean_ms": 4200, "connection_retry_rate": 0.01
        }
    },
    {
        "type": "Port Scanning",
        "src_ip": "185.220.101.5",
        "dst_ip": "10.0.0.22",
        "dst_port": 8080,
        "flow": {
            "flow_duration_ms": 85, "total_fwd_packets": 2, "total_bwd_packets": 0,
            "total_fwd_bytes": 80, "total_bwd_bytes": 0, "packet_length_mean": 40,
            "packet_length_std": 0, "syn_flag_count": 2, "fin_flag_count": 0, "rst_flag_count": 0,
            "psh_flag_count": 0, "ack_flag_count": 0, "urg_flag_count": 0, "flow_bytes_per_sec": 941,
            "flow_packets_per_sec": 23.5, "dst_port_entropy": 0.96, "failed_logins": 0,
            "down_up_ratio": 0.0, "avg_packet_size": 40, "fwd_header_length": 40,
            "bwd_header_length": 0, "active_mean_ms": 85, "idle_mean_ms": 0, "connection_retry_rate": 0.85
        }
    },
    {
        "type": "Brute Force",
        "src_ip": "103.251.167.20",
        "dst_ip": "10.0.0.5",
        "dst_port": 22,
        "flow": {
            "flow_duration_ms": 3200, "total_fwd_packets": 42, "total_bwd_packets": 35,
            "total_fwd_bytes": 8400, "total_bwd_bytes": 6200, "packet_length_mean": 190,
            "packet_length_std": 45, "syn_flag_count": 1, "fin_flag_count": 1, "rst_flag_count": 3,
            "psh_flag_count": 18, "ack_flag_count": 75, "urg_flag_count": 0, "flow_bytes_per_sec": 4562,
            "flow_packets_per_sec": 24.0, "dst_port_entropy": 0.02, "failed_logins": 14,
            "down_up_ratio": 0.73, "avg_packet_size": 189, "fwd_header_length": 840,
            "bwd_header_length": 700, "active_mean_ms": 2500, "idle_mean_ms": 700, "connection_retry_rate": 0.65
        }
    },
    {
        "type": "DDoS / SYN Flood",
        "src_ip": "45.142.195.88",
        "dst_ip": "10.0.0.1",
        "dst_port": 80,
        "flow": {
            "flow_duration_ms": 8500, "total_fwd_packets": 4200, "total_bwd_packets": 2,
            "total_fwd_bytes": 226800, "total_bwd_bytes": 80, "packet_length_mean": 54,
            "packet_length_std": 1.2, "syn_flag_count": 4200, "fin_flag_count": 0, "rst_flag_count": 0,
            "psh_flag_count": 0, "ack_flag_count": 0, "urg_flag_count": 0, "flow_bytes_per_sec": 26691,
            "flow_packets_per_sec": 494.3, "dst_port_entropy": 0.05, "failed_logins": 0,
            "down_up_ratio": 0.0003, "avg_packet_size": 54, "fwd_header_length": 84000,
            "bwd_header_length": 40, "active_mean_ms": 8500, "idle_mean_ms": 0, "connection_retry_rate": 0.98
        }
    }
]

class SentinelAPIHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/":
            self.path = "/frontend/index.html"
            return super().do_GET()
        elif path.startswith("/frontend/"):
            return super().do_GET()
        elif path == "/api/incidents":
            self._handle_get_incidents()
        elif path == "/api/notifications":
            self._handle_get_notifications()
        elif path == "/api/stream/sample":
            self._handle_stream_sample()
        elif path == "/api/powerbi/config":
            self._handle_powerbi_config()
        else:
            super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
        try:
            data = json.loads(body)
        except Exception:
            data = {}

        if path == "/api/analyze":
            self._handle_analyze_flow(data)
        elif path == "/api/mitigate":
            self._handle_mitigate(data)
        else:
            self.send_error(404, "Endpoint not found")

    def _json_response(self, payload, code=200):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(payload, indent=2).encode("utf-8"))

    def _handle_analyze_flow(self, data):
        flow = data.get("flow", {})
        src_ip = data.get("src_ip", f"198.51.{random.randint(10, 200)}.{random.randint(2, 254)}")
        dst_ip = data.get("dst_ip", "10.0.0.1")
        dst_port = data.get("dst_port", 443)

        # 1. Run Deep Learning Model
        analysis = inference_engine.analyze_flow(flow)

        # 2. Geo-Tagging Attacker Location
        geo = geotag_service.lookup_ip(src_ip)

        incident_record = {
            "incident_id": f"SEC-{int(time.time() * 1000)}",
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
            "src_ip": src_ip,
            "dst_ip": dst_ip,
            "dst_port": dst_port,
            "geo": geo,
            "is_hacker": analysis["is_hacker"],
            "user_status": analysis["user_status"],
            "attack_type": analysis["attack_type"],
            "confidence": analysis["confidence"],
            "severity": analysis["severity"],
            "indicators": analysis["indicators"],
            "class_distribution": analysis["class_distribution"],
            "flow_summary": {
                "packets": flow.get("total_fwd_packets", 0) + flow.get("total_bwd_packets", 0),
                "bytes": flow.get("total_fwd_bytes", 0) + flow.get("total_bwd_bytes", 0),
                "duration_ms": flow.get("flow_duration_ms", 0)
            }
        }

        # 3. Store into Firebase Firestore
        firestore_service.record_incident(incident_record)
        firestore_service.record_traffic(flow)

        # 4. Trigger Automated Threat Notification / Calling / Mitigation Sequence if malicious
        mitigation_results = None
        if analysis["is_hacker"] and analysis["severity"] in ["MEDIUM", "HIGH", "CRITICAL"]:
            mitigation_results = alert_service.handle_incident_escalation(incident_record)
            incident_record["mitigation_action"] = mitigation_results

        self._json_response({
            "status": "success",
            "incident": incident_record,
            "mitigation_results": mitigation_results
        })

    def _handle_get_incidents(self):
        incidents = firestore_service.get_recent_incidents(limit=30)
        self._json_response({"incidents": incidents})

    def _handle_get_notifications(self):
        self._json_response({
            "notifications": alert_service.notification_log[-20:],
            "blocked_ips": list(alert_service.blocked_ips)
        })

    def _handle_stream_sample(self):
        # Pick one scenario or randomized sample
        scenario = random.choice(ATTACK_SCENARIOS)
        # Randomize IP slightly
        parts = scenario["src_ip"].split(".")
        parts[-1] = str(random.randint(2, 254))
        randomized_ip = ".".join(parts)

        data = {
            "flow": scenario["flow"],
            "src_ip": randomized_ip,
            "dst_ip": scenario["dst_ip"],
            "dst_port": scenario["dst_port"]
        }
        self._handle_analyze_flow(data)

    def _handle_mitigate(self, data):
        ip = data.get("ip")
        inc_id = data.get("incident_id", "MANUAL-TRIGGER")
        if not ip:
            self._json_response({"error": "Missing IP parameter"}, 400)
            return

        res = alert_service.execute_threat_mitigation(ip, inc_id)
        firestore_service.record_mitigation(res)
        self._json_response({"status": "mitigation_enforced", "details": res})

    def _handle_powerbi_config(self):
        # Power BI Integration configuration
        config = {
            "workspace_id": "sentinel-soc-production-ws",
            "report_id": "threat-trend-analytics-report-2026",
            "embed_url": "https://app.powerbi.com/reportEmbed?reportId=threat-trend-analytics-report-2026",
            "telemetry_metrics": [
                "24h Attack Volume by Category",
                "Mean Time to Detect (MTTD): 18ms",
                "Mean Time to Mitigate (MTTM): 1.4s",
                "Geographic Heatmap Correlation",
                "Port Scanning vs Brute Force Ratio"
            ]
        }
        self._json_response(config)

def run_server(port=8080):
    os.chdir(BASE_DIR)
    server_address = ("", port)
    httpd = HTTPServer(server_address, SentinelAPIHandler)
    print(f"============================================================")
    print(f" Sentinel MLDL NIDS Security Operations Center Active")
    print(f" Serving on http://localhost:{port}")
    print(f" Admin Alert Dispatcher Destination: {alert_service.admin_email}")
    print(f" Deep Learning Model: SentinelNeuralIDS (PyTorch)")
    print(f" Database: Firebase Firestore Active / Simulated Sync")
    print(f"============================================================")
    httpd.serve_forever()

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    run_server(port)
